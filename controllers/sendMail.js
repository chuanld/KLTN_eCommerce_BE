const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const { OAuth2 } = google.auth;
const OAUTH_PLAYGROUND = "https://developers.google.com/oauthplayground";

const {
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  SENDER_EMAIL_ADDRESS,
} = process.env;
const oauth2Client = new OAuth2(
  MAILING_SERVICE_CLIENT_ID,
  MAILING_SERVICE_CLIENT_SECRET,
  MAILING_SERVICE_REFRESH_TOKEN,
  OAUTH_PLAYGROUND
);

//send mail
const sendEmail = (to, url, txt) => {
  oauth2Client.setCredentials({
    refresh_token: MAILING_SERVICE_REFRESH_TOKEN,
  });

  const accessToken = oauth2Client.getAccessToken();
  const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: SENDER_EMAIL_ADDRESS,
      clientId: MAILING_SERVICE_CLIENT_ID,
      clientSecret: MAILING_SERVICE_CLIENT_SECRET,
      refreshToken: MAILING_SERVICE_REFRESH_TOKEN,
      accessToken,
    },
  });
  const mailOptions = {
    from: SENDER_EMAIL_ADDRESS,
    to: to,
    subject: "CHUANG BOOKSTORE",
    html: `<h1>Conratulation</h1><br/><p>${txt}</p><br/>
            <a href=${url}><button style="background-color: red;
            font-size: 20px;
            border-radius: 5px;
            color: white;">Click Here</button></a>
            <div>${url}</div> `,
  };
  const mailOptions1 = {
    from: SENDER_EMAIL_ADDRESS,
    to: to,
    subject: "CHUANG BOOKSTORE",
    html: `<table border="0" cellpadding="0" cellspacing="0" width="100%">
            
            <tbody><tr>
                <td align="center" bgcolor="#f3f3f3" valign="top" style="background:#f3f3f3;color:#000000;padding:20px 0px">
                    <h1 style="margin:0">
                        <a href="https://bookstore-ecommerce-beta.herokuapp.com/">
                            <img src="https://res.cloudinary.com/chuanluu/image/upload/v1638703429/test/logo_hlslof.png">
                        </a>
                    </h1>
                </td>
            </tr>
            
            
            <tr>
                <td align="center" bgcolor="#f3f3f3">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px;padding:0px 10px">
                        <tbody><tr>
                            <td>
                                                            </td>
                        </tr>
                        <tr>
                            <td style="padding:20px;border-bottom:2px solid #dddddd" bgcolor="#ffffff">
                                    <div>${txt}</div>

    <div style="text-align:center">
        
        <a href="${url}" style="display:inline-block;text-decoration:none;width:100px;text-align:center;padding:10px 25px;background-color:#1fbc89;border-radius:4px;font-size:14px;border:none;font-weight:500;color:white">Xác nhận
        </a>
    </div>
    <p><strong>Chú ý:</strong> Bạn nhận đuợc email này vì bạn đang cho phép website chúng tôi gửi email xác nhận tài khoản. Nếu bạn đang không có nhu cầu đăng kí hoặc quên mật khẩu, vui lòng bỏ qua email này. </p>
                            </td>
                        </tr>
                    </tbody></table>
                </td>
            </tr>
            
            
            <tr>
                <td align="center" style="background: #f3f3f3">
                    
                     <div style="text-align:center;font-size:0.9em;padding-top:10px;color:#999">
                        Bạn  muốn nhận thông báo sách mới từ CHUANG BOOKSTORE? <a href="https://bookstore-ecommerce-beta.herokuapp.com/" style="color:#888;display:inline-block;margin:0px 10px;text-decoration:underline" target="_blank" Hãy đăng kí cho chúng tôi.</a>
                    </div>
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width:600px">
                        <tbody><tr>
                            <td style="padding:20px;font-size:12px;color:#888;text-align:center" bgcolor="#f3f3f3" align="center">
                                <p>
                                    <a href="https://bookstore-ecommerce-beta.herokuapp.com/" style="margin:0px 5px" target="_blank" ><img src="https://ci4.googleusercontent.com/proxy/Bm25w2ToKcqgKwh982U6SwEaZxM5zx0unK1-SU0PNH5hJ6MJlS1NsDmCbtiUUsJSzgX-MEbrrYGZRTLN_c9pMQD7MVPIvyEUtIPC=s0-d-e1-ft#https://www.topcv.vn/images/emails/color-facebook-48.png" height="24" width="24" class="CToWUd"></a>
                                    <a href="https://bookstore-ecommerce-beta.herokuapp.com/" style="margin:0px 5px" target="_blank" ><img src="https://ci3.googleusercontent.com/proxy/bldm1k7lCYbBNJ_o4rIFAatPYRCc_McZXGXPmw9X7IgTnKSn6KFK7XOoK7nymCreqyvbarkBgUDiav27bWoIc9QBIOS3wMSs2XE=s0-d-e1-ft#https://www.topcv.vn/images/emails/color-twitter-48.png" height="24" width="24" class="CToWUd"></a>
                                    <a href="https://bookstore-ecommerce-beta.herokuapp.com/" style="margin:0px 5px" target="_blank" ><img src="https://ci3.googleusercontent.com/proxy/JwlnTXph5J5te3fjznpG94vnuP6D3YmsqKvxg4sphmCIYa6J3eApYzVvOgdw37fQ41FH34pentZd_d6iiuS5ElwQiHkPc54=s0-d-e1-ft#https://www.topcv.vn/images/emails/color-link-48.png" height="24" width="24" class="CToWUd"></a>
                                </p>
                                <p>Copyright © 2021 CHUANG team</a>, All rights reserved.</p>
                                <p>
                                    <a href="https://bookstore-ecommerce-beta.herokuapp.com/" style="color:#888;display:inline-block;margin:0px 10px;text-decoration:underline" target="_blank" >Giới thiệu</a>
                                    <a href="mailto:delwynshop2807@gmail.com" style="color:#888;display:inline-block;margin:0px 10px;text-decoration:underline" target="_blank">Chính sách</a>
                                    <a href="https://bookstore-ecommerce-beta.herokuapp.com/" style="color:#888;display:inline-block;margin:0px 10px;text-decoration:underline" target="_blank">Về chúng tôi</a>
                                </p>
                            </td>
                        </tr>
                    </tbody></table>
                </td>
            </tr>
            
        </tbody></table>`,
  };
  smtpTransport.sendMail(mailOptions1, (err, infor) => {
    if (err) return err;
    return infor;
  });
};
module.exports = sendEmail;
