const pool = require('../database');
const env = require('../config/env');
const helpers = require('../lib/helpers.js');

const inviteFriend = async (email, friendEmail) => {
    await pool.query('SELECT * FROM users WHERE email=?', [email], async (err, result, fields) => {
        if (err) {
            console.log(err)
            return false
        }
      
        if(result) {
            let link = result.referral_link
          
            const newMail = {
              to: friendEmail,
              subject: `You got an email from ${result.name}`,
              body: `
              <h3>Hey join with me</h3>
              <p>${link}</p>`
            }
          
            let emailSent = helpers.mailSender(newMail)
          
            if(emailSent){
                return 'Email was sent'
            } else{
                return false
            }
        }
    })
}

const getReferrals = async (auth_token) => {  
  await pool.query('SELECT * FROM users WHERE auth_token=?', [auth_token], (error, user, fieldss) => {
    if(error) {
      console.log(error)
    }

    await pool.query('SELECT * FROM referral WHERE referrer_id=?', [user.id], (err, result, fields) => {
      if(err){
        return false
      }
      return result;
    })
  })
}

module.exports = {
  inviteFriend,
  getReferrals
}