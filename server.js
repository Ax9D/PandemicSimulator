const express=require('express');
const fs=require('fs');

const app=express();
const port=80;


app.use(express.static('public'));
app.get('/',(req,res)=>{
    res.sendFile(__dirname+"/index.htm");
    //res.send("Working");
});


app.listen(port,()=>{console.log("Started server on port: "+port)});