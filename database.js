const mysql = require('mysql')
const {promisify}=require('util')
const {database} =require('./config/env')


const pool = mysql.createPool(database);
pool.getConnection((err, connection)=>{
    if(err){
        if(err.code === 'PROTOCOL_CONNECTION_LOST'){
            console.error('database was closed')
        } 
        if(err.code === 'ER_CON_COUNT_ERROR'){
            console.error('database full connections')

        }
        if(err.code === 'ECONNREFUSED'){
            console.error('database refused the connections')
    }}
    if(connection)connection.release()
    console.log('Db is connected')
})

pool.query=promisify(pool.query)

module.exports = pool
