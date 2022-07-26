//  function twill(){
//     try {
//         twillo.messages.create({
//             from:'+18455249480',
//             to : "+919092484971",
//             body : 'your reset password otp :' + digit
//         }).then(mms=>{
//             console.log("sms sended")
//         }).catch(err=>{
//             console.log('err',err.message)
//         })
//     } catch (err) {
//         console.log(err.message)
//     }
//    }

//     module.exports = {twill}

const { totp } = require("otplib");

function verifyotp() {
  const otpkey = "divya_otp_23";
  const token = totp.generate(otpkey);
  console.log("token:" + token);
  return token;
}

// function verifyotp(type){
//     if( type == 'send'){
//         const secretkey="divya_otp_23";
//     const token = totp.generate(secretkey)
//     console.log("token:"+ token)
//     return token
//     }else if(type == 'resend'){
//         const secretkey= 'divya_otp_23'
//         const token = totp.generate(secretkey)
//         console.log("resend token:"+ token)
//         return token
//     }

// }

// function verify() {
//   const secretkey = "divya_otp_23";
//   const token = totp.generate(secretkey);
//   console.log("token:" + token);
//   const compare = totp.check(token, secretkey);
//   console.log(compare);
// }

// verifyotp("resend");
// verify();

// module.exports = { verifyotp, verify };
