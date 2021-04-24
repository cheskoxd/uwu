const pool = require('../database');
const env = require('../config/env');
const helpers = require('../lib/helpers.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { encryptPassword } = require('../lib/helpers.js');

// Helper function for token hash generating
const getToken = (email, password) => {
    let token = null;

    try {
        token = jwt.sign({ email, password }, env.JWT_SECRET, { algorithm: 'HS256' })
        if (token == null) {
            let response = {
                'response': 'error',
                'message': 'Password or email is invalid`',
                'token': token
            };
        }
    } catch (err) {
        let response = {
            'response': 'error',
            'message': 'Token creation failed',
        };
    }
    return token
}

const signup = async (req,res) => {
    let {
        first_name,
        last_name,
        password,
        email
    } = req.body

    // Check for undefined values
    if (first_name == undefined || last_name == undefined || password == undefined || email == undefined) {
        let response = {
            'error': true,
            'reas ': 'Data is not defined`',
        };
    } else {

        // Email validation
        if (!(helpers.validateEmail(email))) {
            let response = {
                'error': true,
                'reason': 'Email is invalid',
            };
        }else {
            // Increase referrals count by 1
            if (req.body.reff != undefined) {
                await pool.query('SELECT * FROM users WHERE email=?', [email], (err, result, fields) => {
                    if (!(err) && result) {
                        result.referral_count = result.referral_count + 1;
                        await pool.query('UPDATE users SET ? WHERE email=?', [result, email])
                    } else {
                        throw err
                    }
                })
            }

            // New user initial data
            let newUser = {
                first_name: first_name,
                last_name:last_name,
                email:email,
                password:password,
                ethereum_wallet_pub: null,
                bitcoin_wallet_pub: null,
                auth_token: '',
                referral_link: env.APP_URL + "/sign-up?ref='" + email,
                referrer_id: (reffId) ? reffId.id : null,
                verification_token: helpers.generateRandomString(40),
                verified: false
            }
            
            // Password hash generation (bcrypt)
            bcrypt.hash(password, env.SECRET_SALT, function(err, hash) {
                if (err) throw err;
                newUser.password = hash
            });
            
            if (reffId) {
                await pool.query('SELECT * FROM referral WHERE user_email=?', [email], (err, result, fields) => {
                    if (!(err) && result) {
                        result.registered = true;
                        await pool.query('UPDATE referral SET ? WHERE user_email=?', [result, email])
                    } else {
                        throw err
                    }
                })
            }

            let verifyLink = env.APP_URL + "/login/verify?email=" + newUser.email + '&token=' + newUser.verification_token
            
            // Send Mail to newUser.email
            const newMail = {
                to: newUser.email,
                subject: 'Verify your account',
                body: `
                        <h3>Verify your account</h3>
                        <p>${verifyLink}</p>
                        `
            }

            let emailSent = helpers.mailSender(newMail)

            if(!emailSent){
                let response = {
                    'success': false,
                    'reason': 'Couldn\'t send verification email',
                };
    
                return false
            }

            // Token generating
            let token = getToken(newUser.email, newUser.password)
            if (typeof(token) == 'string') {
                res.json({ 'success': false, 'message': 'Token generation failed'})
            }

            newUser.auth_token = token;

            // User data saving to DB
            await pool.query('INSERT INTO users SET ?', [newUser], (err, result, fields) => {
                if (err) {
                    let response = {
                        'success': false,
                        'reason': 'Couldn\'t register user',
                    };
                } else {
                    let response = {
                        'success': true,
                        'email': newUser.email,
                    };
                }
                
            })
            res.json({response})
        }
    }

    res.json({ response })
}

const login = async (req, res) => {
    let {
        email,
        password
    } = req.body

    // Check user in DB
    await pool.query('SELECT * FROM users WHERE email=?', [email], (err, result, fields) => {
        if (result) {

            // Comparises user password 
            bcrypt.compare(password, result.password, function(err, check) {

                // Password check
                if (check) {

                    // Get new token for user
                    let newToken = getToken(result.email, result.password);
                    result.auth_token = newToken;

                    await pool.query('UPDATE users SET ?', [result])

                    // Success
                    let response = {
                        'success': true, 
                        'data': {
                            'id': result.id,
                            'first_name': result.first_name, 
                            'last_name': result.last_name, 
                            'email': result.email, 
                            'referral_link': result.referral_link, 
                            'referral_count': result.referral_count,
                            'created_at' :  result.created_at,
                            'verification_token' :  result.verification_token,
                            'verified' :  result.verified,
                            'bitcoin_wallet_pub': result.bitcoin_wallet_pub,
                            'ethereum_wallet_pub': result.ethereum_wallet_pub,
                            'auth_token': result.auth_token,
                        }
                    }
                } else {
                    let response = {
                        'success': false,
                        'message': 'Incorrect password',
                    };
                }  
            });
        } else {
            let response = {
        		'success': false,
            	'message': 'Please create an account first',
            }
        }
        res.json(response)
    })
}

const recoverAccount = (email)=>{

    // Get user info
    await pool.query('SELECT * FROM users WHERE email=?', [email], (err, result, fields) => {

        if(err){
            console.log(err)
            return false
        }

        // Link for recovering
        let changePasswordLink = env.APP_URL + "/login/recover?email=" + result.email + '&token=' + result.verification_token

        // Mail sending
        const newMail = {
            to:newUser.email,
            subject:'Recover your account',
            body:`
            <h3>Recover your account</h3>
            <p>${changePasswordLink}</p>
            `
        }

        let emailSent = helpers.mailSender(newMail)

        if(!emailSent){
            let response = {
                'success': false,
                'reason': 'Couldn\'t send recovery email',
            };

            return false
        }

    })
}

const changePassword = async (old_password, new_password, email) => {
    
    // Get user
	await pool.query('SELECT * FROM users WHERE email=?', [email], (err, result, fields) => {

		if (err) {
			console.error(err)
			return {
                'success': false,
                'message': 'Error'
            }
		}

		if (result) {
            // Check password
            if (helpers.matchPassword(old_password, result.password)) {
                // Generate new password and save
                result.password = helpers.encryptPassword(new_password);
                await pool.query('UPDATE users SET ? WHERE email=?', [result, email])
                return {
                    'success': true
                }
            } else {
                return {
                    'success': false,
                    'message': "Password isn't correct"
                }
            }
		}
	})
}

const verifyAccount = async (req, res) => {
	let email = req.query.email
	let token = req.query.token

    // Get data
	await pool.query('SELECT * FROM users WHERE email=?', [email], (err, result, fields) => {
		if (err) {
			console.error(err)
			return { 'success': false }
		}

		if (token == result.verification_token) {
            result.verification_token = null;
			result.verify = true
			await pool.query('UPDATE users SET ? WHERE email=?', [result, email])

            return {
                'success': true
            }
		} else {
			return { 'success': false }
		}
	})
}

const updateSettings = async (email, data) => {
	await pool.query('SELECT * FROM users WHERE email=?', [email], (err, result, fields) => {
		if (err) {
			console.log(err)
			return {
                'success': false,
            }
        } else {
            try {
                await pool.query('UPDATE users SET ? WHERE email=?', [data, email], (err, result, fields) => {
                    if (err) {
                        throw err
                    } else {
                        return { 'success': true, 'data': result}
                    }
                })

            } catch (err) {
                console.log(err)

                return {
                    'success': false,
                    'message': 'Something went wrong'
                }
            }
            
        }
	})
}

const resetPassword = async (email, resetToken, newPassword) => {
    await pool.query('SELECT * FROM users WHERE email=', [email], (err, result, field) => {
        if (err) throw err;
        
        if (result && result.reset_token == resetToken) {
            result.password = encryptPassword(newPassword);
            result.reset_token = null;

            await pool.query('UPDATE users SET ? WHERE email=?', [result, email], (err, result, fields) => {
                if (!(err) && result) {
                    return {
                        'success': true
                    }
                }
            })
        } else {
            return {
                'success': false,
                'message': 'Wrong credentials'
            }
        }
    })
}

module.exports = {
    signup,
    login,
    changePassword,
    verifyAccount,
    updateSettings,
    recoverAccount,
    resetPassword
}