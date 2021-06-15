export default {
  database: {
    type: 'postgres',
    userName: 'xwspgkuz',
    password: 'bWtqnqovd2MYIfJxr1bscjmuuNKHJ2zu',
    host: 'rogue.db.elephantsql.com',
    port: 5432,
    databaseName: 'xwspgkuz',
    synchronize: true,
    autoLoadEntities: true,
  },
  aws: {
    accessKey: 'AKIAZ7ZP63A5GC6735AP',
    secretKey: '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',
    consoleLogin: 'https://bucket-cgp-staging.s3.eu-central-1.amazonaws.com',
    bucket: {
      name: 'bucket-cgp-staging',

      // QA buckets
      // articles: 'bucket-cgp-staging/QA/articles',
      // cgpBannerImage: 'bucket-cgp-staging/QA/cgp/bannerImage',
      // cgpLogo: 'bucket-cgp-staging/QA/cgp/logo',
      // teamsBannerImage: 'bucket-cgp-staging/QA/teams/bannerImage',
      // profileImage: 'bucket-cgp-staging/QA/profile/profileImage',

      // Staging buckets
      articles: 'bucket-cgp-staging/Staging/articles',
      cgpBannerImage: 'bucket-cgp-staging/Staging/cgp/bannerImage',
      cgpLogo: 'bucket-cgp-staging/Staging/cgp/logo',
      teamsBannerImage: 'bucket-cgp-staging/Staging/teams/bannerImage',
      profileImage: 'bucket-cgp-staging/Staging/profile/profileImage',
    },
  },
  server: {
    host: '0.0.0.0',
    port: '3000',
  },
  jwt: {
    secretOrKey: 'see-45654-dgdfg',
    expiresIn: 30000,
    tokenType: 'Bearer',
  },
  mail: {
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    user: 'info@patrimonist.com',
    pass: 'angdeoacsekaxhxu',
    senderMail: 'contact@cgp.fr',
  },
  serverUrl: {
    url: 'http://18.184.207.46:3001',
  },
  serverApi: {
    API: 'http://18.184.207.46',
  },
  appUrl: 'http://18.184.207.46',
  googleApiKey: 'AIzaSyBJc9TVKg1zjpjU_LJYVeeI62wxm6ss7UU',
};
