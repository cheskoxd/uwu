const pool = require('../database');
const env = require('../config/env');


const getCampaigns = async (auth_token)=>{

    
    //check if the user exists
    await pool.query('SELECT * FROM users WHERE auth_token=?', [auth_token], (err, user_campaigns, fields) => {
    
        if (err) {
			console.error(err)
			return {
                'success': false,
                'message': 'Error'
            }
		}

        await pool.query('SELECT * from campaigns', (err, all_campaigns, fields) => {
            if (!(err) && result) {
                all_campaigns.forEach(campaign => {
                    if (user_campaigns != null) {
                        user_campaigns.forEach(completed => {
                            if (campaign['id'] == completed['id']) {
                                campaign['completed'] = true;
                            } else {
                                campaign['completed'] = false;
                            }
                        });
                    } else {
                        completed['completed'] = false;
                    }
                });
            }
        })

        return allCampaigns
    })
}

const completeCampaign = async (user_id,campaign_id)=>{

    let newCampaign = {
        user_id:user_id,
        campaign_id: campaign_id
    } , response

    await pool.query('INSERT INTO user_campaign SET ?', [newCampaign], (error) => {
        if (err) {
            response = {
                'success': false,
                'reason': 'Couldn\'t complete campaign',
            };
        } else {
            response = {
                'success': true,
                'reason': 'Campaign Completed',
            };
        }
        return response
    })

}

const campaignProgress = (auth_token) => {
    await pool.query('SELECT * FROM users WHERE auth_token=?', [auth_token], (err, userData, fields) => {
        await pool.query('SELECT * FROM campaigns WHERE user_id=?', [userData.id], (err, userCampaigns) => {
            return {
                'success': true,
                'completed': userCampaigns.length,
                'remaining': allCampaigns.length - userCampaigns.length;
            }
        })
    })
}

module.exports = {
    getCampaigns,
    completeCampaign,
    campaignProgress
}