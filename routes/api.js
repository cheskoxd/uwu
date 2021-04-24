const ApiController = require('../controllers/ApiController.js')
const campaignController = require('../controllers/CampaignController.js')
const InviteController = require('../controllers/InviteController.js')
const bodyParser = require('body-parser');
var urlencodedParser = bodyParser.urlencoded({ extended: true });


app.post('/signup', urlencodedParser, ApiController.signup);
app.post('/login', urlencodedParser, ApiController.login);
app.post('/change_password', urlencodedParser, ApiController.changePassword);
app.post('/verify_account', urlencodedParser, ApiController.verifyAccount);
app.post('/update_settings', urlencodedParser, ApiController.updateSettings);
app.post('/reset_password', urlencodedParser, ApiController.resetPassword);

app.post('/get_campaigns', urlencodedParser, campaignController.getCampaigns);
app.post('/complete_campaign', urlencodedParser, campaignController.completeCampaign);
app.post('/campaign_progress', urlencodedParser, campaignController.campaignProgress);

app.post('/invit_friend', urlencodedParser, InviteController.inviteFriend);
app.post('/get_referrals', urlencodedParser, InviteController.getReferrals);

