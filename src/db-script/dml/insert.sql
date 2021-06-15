
INSERT INTO public.notification (notification_id, notification_name, notification_message, status_code, last_updated) VALUES (104101, 'user register success', 'Your registration was successful!', NULL, '2021-02-10 13:11:49.243');
INSERT INTO public.notification (notification_id, notification_name, notification_message, status_code, last_updated) VALUES (104104, 'login failure', 'Login credentials entered are incorrect', NULL, '2021-02-10 13:14:46.571');
INSERT INTO public.notification (notification_id, notification_name, notification_message, status_code, last_updated) VALUES (104102, 'Exsit Email', 'Email is already in exsit', NULL, '2021-02-10 13:12:51.873');
INSERT INTO public.notification (notification_id, notification_name, notification_message, status_code, last_updated) VALUES (104103, 'invalid Email', 'Email is inValid ', NULL, '2021-02-10 13:13:27.724');
INSERT INTO public.notification (notification_id, notification_name, notification_message, status_code, last_updated) VALUES (104105, 'login success', 'Login  is successful     ', NULL, '2021-02-10 13:15:22.933');
INSERT INTO public.notification (notification_id, notification_name, notification_message, status_code, last_updated) VALUES (104106, 'Forgot Password success', 'A link has been sent to your registered email address to reset password.', NULL, '2021-02-10 13:16:07.201');
INSERT INTO public.notification (notification_id, notification_name, notification_message, status_code, last_updated) VALUES (104107, 'Password not Matched', 'Password is not matched', NULL, '2021-02-10 13:17:05.379');
INSERT INTO public.notification (notification_id, notification_name, notification_message, status_code, last_updated) VALUES (104108, 'Password not Matched', 'Your password is Reseted', NULL, '2021-02-10 13:17:05.379');
INSERT INTO public.notification (notification_id, notification_name, notification_message, status_code, last_updated) VALUES (104109, 'CGP Profile Added', 'CGP Profile Added Successful!', NULL, '2021-02-10 13:17:05.379');
INSERT INTO public.notification (notification_id, notification_name, notification_message, status_code, last_updated) VALUES (104110, 'CGP Account Verified', 'CGP Account Is Verified.  ', NULL, '2021-02-10 13:17:05.379');
INSERT INTO public.notification (notification_id, notification_name, notification_message, status_code, last_updated) VALUES (104111, 'Internal server error', 'Internal server error', NULL, '2021-02-10 13:17:05.379');
INSERT INTO public.notification (notification_id, notification_name, notification_message, status_code, last_updated) VALUES (104112, 'CGP Profile is Updated', 'CGP Profile is Updated', NULL, '2021-02-16 15:34:05.322');




INSERT INTO public.mail_template (template_id, template_name, subject, body, status, last_updated) VALUES (105101, 'User Register Mail Template', 'Thank you for registering with  <%= productName %>', '<body><h4>Dear <%= firstName %><%= lastName %></h4><br><h2>Welcome to <%= productName %>!</h2><p>Thank you for registering with us. Find your account details as below</p><br>
<h6>Email address:</h6><%= email %> <br><h6>Password:</h6><%= password %> <br> <p>Regards</p> <p>Admin</p>
</body>', 'Active', '2021-02-13 19:01:51.277');
INSERT INTO public.mail_template (template_id, template_name, subject, body, status, last_updated) VALUES (105103, 'User Reseted Mail Template', 'Password Reset successfully', '<body><h4>Dear <%= firstName %><%= lastName %></h4><h4>our password has been reset successfully.</h4><h6>Login to application via this url </h6>
<p>Regards</p><p>Admin</p></body>', 'Active', '2021-02-13 19:05:47.361');
INSERT INTO public.mail_template (template_id, template_name, subject, body, status, last_updated) VALUES (105102, 'User Forgot Password Template', 'Forgotten Password reset', '<body><h4>Dear <%= firstName %><%= lastName %></h4><br><p>You have recently requested to reset password for your <%= productName %> account. Click the button below to reset it.</p><br><br> 
 <div><a href="http://localhost:4200/#/public/login?token=<%= token %>" target="_blank">Click Me</a></div><h6>If you did not request a password reset, please ignore this email. This password reset is valid only for the next 10 mins</h6><br><p>Regards</p><p>Admin</p>
</body>', 'Active', '2021-02-13 19:04:05.228');
INSERT INTO public.mail_template (template_id, template_name, subject, body, status, last_updated) VALUES (105104, 'Account Verfication Template', 'Account Verfication', '''', 'Active', '2021-02-13 19:04:05.228');




