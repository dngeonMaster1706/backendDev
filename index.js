require('dotenv').config()
const express = require('express')


const app = express()

const port = 4000

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/about',(req,res)=>{
    res.send('kaushikborah')
})

app.get('/login',(req,res)=>{
    res.send('please login')
})

app.get('/youtube',(req,res)=>{
    res.send('hiii')
})

app.listen(process.env.PORT, () => {
  console.log(`Example app listening on port ${port}`)
})