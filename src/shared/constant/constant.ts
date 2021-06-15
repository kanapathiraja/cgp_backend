export const constant = {

    // notification code send to response or error throw front end check multiple language
    notification : {

        registerSuccessMessage : '104101',      //          Your registration was successful!
        isExsitingEmail  : '104102',            //          Email is already  exsit
        isValidEmail    : '104103',             //          Email is inValid
        invalidLogin : '104104',                //          Login credentials entered are incorrect
        isLoginSuccessFul : '104105',           //          login  was successful
        isForgotSuccessFul: '104106',           //          A link has been sent to your registered email address to reset password.
        isPassWordMisMatch: '104107',           //          Password is not matched
        passwordResetSuccess: '104108',         //          Your password is Reseteds
        cgpAddProfileDetails: '104109',         //          cgp Added Profile Details
        cgpEmailVerified: '104110',             //          CGP Account Is Verified.
        internalError: '104111',                //          Internal Server Error.
        cgpProfileUpdated: '104112',            //          CGP Profile Is Updated.
        isSuccessFul: '104113',                 //          Sucsess Message
        userNotFound: '104114',                 //          User not found
        UserEmailVerified: '104115',
        EmailVerifiedSuccess: '104116',         //          Email verification success
        UserRegisterSuccess: '104117',          //          User registration successfull
        cgpRequestSuccess: '104118',            //          cgp new request successfull
        isCGPApproved: '104119',                //          cgp user request is Approved
        isCGPRejected: '104120',                //          cgp user request is Rejected
        invalidInput: '104121',                //           Input is not valid
        CGPNotFound: '104122',                //           Input is not valid
        CGPUpdateSuccess: '104123',           //           Input is not valid
        wrongOldPassword: '104124',           //          Old Password does not match
        passwordChangeSuccess: '104125',
        validToken: '104126',                 //          validToken
        inValidToken: '104127',               //          Password Changed successfully
        inValidAddress: '104128',      //          invalid address
        articleDeleteSuccess: '104129',       //           Article deleted successfully,
        articleListSuccess: '104130',         //           Article list fetched successfully
        articleDetailsSuccess: '104131',       //           Article details fetched successfully
        articleRequestSuccess: '104132',      //          Article Created successfully
        articleUpdateSuccess: '104133', //           Article Updated successfully
        articleNotFound: '104134',            //           Article Not found
        isCgpNameExists  : '104135',            //          establishmentName is already  exsit
        isArticleTitleExists  : '104136',            //          article title is already  exsit
        emailExists: '104137',                        //    Email already exists
        emailNotExists: '104138',                        //    Email Not exists
        isExsitingSiret  : '104139',            //          Siret is already  exsit
        teamRemovedSuccess : '104140',           //      removed sussecfully
        teamNotFount: '104141'

    },

    mailTemplate: {
        userRegisteredTemplate: '816914',     //          Email Template in User registered Service
        forgotPasswordTemplate: '761979',         //          Email Template in User forgotPassword Service
        cgpRequestTemplate: '181837',        //          Email Template in User resetedPassword Service
        adminCGPProfileVerifiedTemplate: '393665',    //          Cgp Account Email Verify Admin
        cgpSetPasswordTemplate: '495934',     //          Cgp Account Email Verify Admin
        userResetPasswordTemplate: '105106',      //          Cgp Account Email Verify Admin
        teamUserRegisteredTemplate: '816915',      //          Email Template in Team User register Service
    },
    jwtConstants: {
        secret: 'secretKey',
      }
}
