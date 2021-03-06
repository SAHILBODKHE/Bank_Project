const express = require('express')
const https = require('https')
const bodyParser = require('body-parser')
const pool = require('./db')
const path = require('path')
const { kill, send } = require('process')
const req = require('express/lib/request')

const { dirname } = require('path')
const { reset } = require('nodemon')
const { readlink } = require('fs')
const app = express()
app.use(express.static(path.join(__dirname, 'public')))
app.set('view engine', 'ejs')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(express.json())
app.listen(3000, function () {
  console.log('Server is running on port 3000')
})
app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
})
app.post('/match/verify', async (req, res) => {
  var today = new Date()
  var dd = String(today.getDate()).padStart(2, '0')
  var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
  var yyyy = today.getFullYear()

  today = mm + '/' + dd + '/' + yyyy
  try {
    var fn = req.body.fname
    var ln = req.body.lname
    var adhc = req.body.aid
    var em = req.body.emid
    var add = req.body.addr
    var county = req.body.cont
    var st = req.body.state
    var zp = req.body.zip
    var pancd = req.body.panc
    var frname = req.body.fathn
    var mn = req.body.moname
    var pd = req.body.passw
    var kk = req.body.username
    var mb = req.body.mobile
    var regd = await pool.query(
      'INSERT INTO new_user( first_name ,second_name, father_name , email , address1 , mother_name , zipcode , adhaar_card,country , state, pancard_no, password,username,mobile) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)',
      [fn, ln, frname, em, add, mn, zp, adhc, county, st, pancd, pd, kk, mb],
    )
    var ret = await pool.query(
      'SELECT user_id,password,username FROM new_user where email=$1 and pancard_no=$2 order by user_id desc limit 1',
      [em, pancd],
    )

    let acn = []
    console.log(fn, ln, adhc, em, add, county, st, zp, pancd, frname, mn, pd)
    ret.rows.forEach((el) => {
      acn.push(el.user_id)
      acn.push(el.password)
      acn.push(el.username)
    })
    var log = await pool.query(
      "INSERT INTO login_p VALUES($1,$2,$3,'credit',$4,1000)",
      [acn[0], acn[1], acn[2], today],
    )
    var account = await pool.query(
      `create TABLE ${acn[2]} (account_id uuid references login_p(account_no) ON DELETE CASCADE ON UPDATE
      CASCADE ,transc_desc varchar(10),trans_amount numeric(8,2),tsmp TIMESTAMP,trans_id uuid default uuid_generate_v4() PRIMARY KEY)`,
    )
    res.send(`You acc id is :${acn[0]}`)
  } catch (err) {
    console.log(err.message)
  }
})
app.post('/login/user', async (req, res) => {
  try {
    var acno = req.body.Username
    var pd = req.body.pwd
    // var login = await pool.query(
    //   'SELECT COUNT(*) FROM new_user where user_id=$1 and password=$2',
    //   [acno, pd],
    // )

    var login = await pool.query(
      'SELECT *,COUNT(*) FROM login_p where username=$1 and pin=$2 GROUP BY account_no',
      [acno, pd],
    )
    var updthist = await pool.query(`SELECT * FROM ${acno}`)
    console.log(updthist.rows)
    let pt = []

    updthist.rows.forEach((el) => {
      pt.push(el.account_id),
        pt.push(el.transc_desc),
        pt.push(el.trans_amount),
        pt.push(el.tsmp),
        pt.push(el.trans_id)
    })
    // console.log(acno, pd, login.rows)
    let rl = []
    let accno = []
    let un = []
    let cb = []
    login.rows.forEach((el) => {
      rl.push(el.count)
      accno.push(el.account_no)
      un.push(el.username)
      cb.push(el.current_bal)
    })
    console.log(...pt)
    if (rl == 1) {
      res.render('transact', { uid: accno, usn: un, cbl: cb, pto: pt })
    }
  } catch (err) {
    console.log(err.message)
  }
})
app.post('/username/:un/:acno/:cbl/:ty/pin', async (req, res) => {
  try {
    let al = []

    al.push(req.params.un)
    al.push(req.params.acno)

    al.push(req.params.cbl)
    al.push(req.params.ty)
    al.push(req.body.acid)
    al.push(req.body.amt)
    console.log(...al)

    res.render('pain', { kl: al })
  } catch (err) {
    console.log(err.message)
  }
})
app.post('/username/:un/:acno/:cbl/:ty', async (req, res) => {
  try {
    var today = new Date()
    var dd = String(today.getDate()).padStart(2, '0')
    var mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
    var yyyy = today.getFullYear()
    var time = today.getTime()

    today = mm + '/' + dd + '/' + yyyy
    var pwr = req.body.pin
    var accno = req.body.acid
    var amo = req.body.amt
    var typo = req.params.ty
    var uno = req.params.un
    var lk = req.params.acno
    // var sec = await pool.query(
    //   'SELECT COUNT(*) FROM login_p where account_no=$1 and pin=$2',
    //   [accno, pwr],
    // )
    var login = await pool.query(
      'SELECT COUNT(*) FROM new_user where user_id=$1 and password=$2',
      [lk, pwr],
    )
    var debe = await pool.query(
      'SELECT username FROM new_user where user_id=$1',
      [accno],
    )
    let db = []
    debe.rows.forEach((el) => {
      db.push(el.username)
    })
    console.log(...db)
    let dj = []
    login.rows.forEach((el) => {
      dj.push(el.count)
    })
    console.log(...dj)
    if (dj[0] == 1 && db !== null) {
      if (typo == 'debit') {
        var updt = await pool.query(
          "UPDATE login_p SET transc_type='debit',current_bal=current_bal-$1 where account_no=$2",
          [amo, lk],
        )
        var hist = await pool.query(`INSERT INTO ${uno} values($1,$2,$3,$4)`, [
          accno,
          typo,
          amo,
          today,
        ])
        var updr = await pool.query(
          "UPDATE login_p SET transc_type='credit',current_bal=current_bal+$1 where account_no=$2",
          [amo, accno],
        )
        var finalh = await pool.query(
          `INSERT INTO ${db[0]} values($1,$2,$3,$4)`,
          [lk, 'credit', amo, today],
        )
        res.render('sucess')
      }
      if (typo == 'credit') {
        var crd = await pool.query(
          "UPDATE login_p SET transc_type='credit',current_bal=current_bal+$1 where account_no=$2",
          [amo, accno],
        )
        var loan = await pool.query(
          'INSERT INTO loan(loan_accountno,amount) VALUES ($1,$2)',
          [accno, amo],
        )
        var hist = await pool.query(`INSERT INTO ${uno} values($1,$2,$3,$4)`, [
          accno,
          typo,
          amo,
          today,
        ])

        res.render('sucess')
      }
    }
  } catch (err) {
    console.log(err.message)
  }
})
app.post('/close/account/:usn', async (req, res) => {
  try {
    var acno = req.body.uid
    var pins = req.body.pass
    var usnm = req.params.usn
    var login = await pool.query(
      'SELECT COUNT(*) FROM login_p where username=$1 and pin=$2 GROUP BY account_no',
      [usnm, pins],
    )
    let rl = []
    login.rows.forEach((el) => {
      rl.push(el.count)
    })
    if (rl == 1) {
      var del4 = await pool.query('DELETE FROM loan where loan_accountno=$1', [
        acno,
      ])
      var del3 = await pool.query(`DROP TABLE ${usnm} `)
      var del2 = await pool.query('DELETE FROM login_p where username=$1', [
        usnm,
      ])
      var del = await pool.query('DELETE FROM new_user where username=$1', [
        usnm,
      ])

      res.render('sucess')
    } else {
      console.log('error')
    }
  } catch (err) {
    console.log(err.message)
  }
})
