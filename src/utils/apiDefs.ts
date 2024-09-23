import appConfig from './config.js';
import argvUtils from './argv.js';

const apiDefs = {
  jmatile_nowc_dataStatus() {
    return {
      endpoint: `https://${appConfig.network.jmaApi.baseDomain}${appConfig.network.jmaApi.apiPath}/jmatile/data/nowc/dataStatus.json`,
      params: {},
    };
  },
  jmatile_nowc_targetTimes_n1() {
    return {
      endpoint: `https://${appConfig.network.jmaApi.baseDomain}${appConfig.network.jmaApi.apiPath}/jmatile/data/nowc/targetTimes_N1.json`,
      params: {},
    };
  },
  jmatile_nowc_targetTimes_n2() {
    return {
      endpoint: `https://${appConfig.network.jmaApi.baseDomain}${appConfig.network.jmaApi.apiPath}/jmatile/data/nowc/targetTimes_N2.json`,
      params: {},
    };
  },
  jmatile_nowc_targetTimes_n3() {
    return {
      endpoint: `https://${appConfig.network.jmaApi.baseDomain}${appConfig.network.jmaApi.apiPath}/jmatile/data/nowc/targetTimes_N3.json`,
      params: {},
    };
  },
  jmatile_rasrf_targetTimes() {
    return {
      endpoint: `https://${appConfig.network.jmaApi.baseDomain}${appConfig.network.jmaApi.apiPath}/jmatile/data/rasrf/targetTimes.json`,
      params: {},
    };
  },
  // html_artwork (id) {
  //   return {
  //     endpoint: `https://${appConfig.network.api.baseDomain}/artworks/${id}`,
  //     params: {}
  //   }
  // },
  // ajax_login () {
  //   return {
  //     endpoint: `https://${appConfig.network.api.baseAccountDomain}${appConfig.network.api.apiPath}/login`,
  //     params: {}
  //   }
  // },
  // ajax_signup_mailAddress (mail_address, password, g_recaptcha_response, app_ios = 0, tt) {
  //   return {
  //     endpoint: `https://${appConfig.network.api.baseAccountDomain}${appConfig.network.api.apiPath}/signup/mail-address`,
  //     params: {},
  //     body: {
  //       mail_address, password, g_recaptcha_response, app_ios, tt
  //     }
  //   }
  // },
  // ajax_signup_pin (pin, hash, tt) {
  //   return {
  //     endpoint: `https://${appConfig.network.api.baseAccountDomain}${appConfig.network.api.apiPath}/signup/pin`,
  //     params: {},
  //     body: {pin, hash, tt}
  //   }
  // },
  // ajax_signup_personalInfo (password, hash, pin, user_name, sex, birthday_year, birthday_month, birthday_day, agreement = 1, recaptcha_enterprise_score_token, source = 'accounts', ref = '', app_ios = 0, return_to = 'https://www.pixiv.net/', tt) {
  //   return {
  //     endpoint: `https://${appConfig.network.api.baseAccountDomain}${appConfig.network.api.apiPath}/signup/personal-info`,
  //     params: {},
  //     body: {password, hash, pin, user_name, sex, birthday_year, birthday_month, birthday_day, agreement, recaptcha_enterprise_score_token, source, ref, app_ios, return_to, tt}
  //   }
  // },
  // ajax_top_illust (mode = 'all') {
  //   const validMode = ['all', 'safe', 'r18'];
  //   if (validMode.includes(mode) !== true) throw new Error('coverImage Req type is not valid');
  //   return {
  //     endpoint: `https://${appConfig.network.api.baseDomain}${appConfig.network.api.apiPath}/top/illust`,
  //     params: {'mode': mode}
  //   }
  // },
  // ajax_user_extra () {
  //   return {
  //     endpoint: `https://${appConfig.network.api.baseDomain}${appConfig.network.api.apiPath}/user/extra`,
  //     params: {}
  //   }
  // },
  // health () {
  //   const baseDomain = appConfig.network.api.baseDomain[argvUtils.getArgv().server];
  //   return {
  //     endpoint: `https://${baseDomain}${appConfig.network.api.apiPath}/health`,
  //     params: {}
  //   }
  // },
  // worksListing (page, sort = 'asc', order = 'create_date', subtitle = 0) {
  //   const baseDomain = appConfig.network.api.baseDomain[argvUtils.getArgv().server];
  //   return {
  //     endpoint: `https://${baseDomain}${appConfig.network.api.apiPath}/works`,
  //     params: {
  //       'order': order,
  //       'sort': sort,
  //       'subtitle': subtitle,
  //       'page': page
  //     }
  //   }
  // },
  // search (query, page, sort = 'asc', order = 'create_date', subtitle = 0) {
  //   const baseDomain = appConfig.network.api.baseDomain[argvUtils.getArgv().server];
  //   return {
  //     endpoint: `https://${baseDomain}${appConfig.network.api.apiPath}/search/${encodeURIComponent(query)}`,
  //     params: {
  //       'order': order,
  //       'sort': sort,
  //       'subtitle': subtitle,
  //       'page': page
  //     }
  //   }
  // },
  // workInfoUser (workId) {
  //   const baseDomain = appConfig.network.api.baseDomain[argvUtils.getArgv().server];
  //   return {
  //     endpoint: `https://${baseDomain}${appConfig.network.api.apiPath}/work/${workId}`,
  //     params: {}
  //   }
  // },
  // workInfo (workId) {
  //   const baseDomain = appConfig.network.api.baseDomain[argvUtils.getArgv().server];
  //   return {
  //     endpoint: `https://${baseDomain}${appConfig.network.api.apiPath}/workInfo/${workId}`,
  //     params: {}
  //   }
  // },
  // workFolderStructure (workId) {
  //   const baseDomain = appConfig.network.api.baseDomain[argvUtils.getArgv().server];
  //   return {
  //     endpoint: `https://${baseDomain}${appConfig.network.api.apiPath}/tracks/${workId}`,
  //     params: {}
  //   }
  // },
  // redirectStream (workId, trackId) {
  //   const baseDomain = appConfig.network.api.baseDomain[argvUtils.getArgv().server];
  //   return {
  //     endpoint: `https://${baseDomain}${appConfig.network.api.apiPath}/media/stream/${workId}/${trackId}`,
  //     params: {}
  //   }
  // },
  // coverImage (workId, type = 'main') {
  //   if (type !== ('main' || '240x240' || 'sam')) throw new Error('coverImage Req type is not valid');
  //   const baseDomain = appConfig.network.api.baseDomain[argvUtils.getArgv().server];
  //   return {
  //     endpoint: `https://${baseDomain}${appConfig.network.api.apiPath}/cover/RJ${workId}.jpg`,
  //     params: {
  //       'type': type
  //     }
  //   }
  // }
};

const defaultApiConnectionHeader = {
  'User-Agent': appConfig.network.userAgent.chromeWindows,
  // 'Content-Type': 'application/json',
  // Referer: 'https://' + appConfig.network.api.refererUrl,
  'Cache-Control': 'no-cache',
};

export default {
  apiDefs,
  defaultApiConnectionHeader,
};
