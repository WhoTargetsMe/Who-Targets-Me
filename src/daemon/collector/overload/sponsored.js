export const parseSponsoredPost = (post) => {
  const { data } = JSON.parse(post);
  const requestBody = {};

  Object.entries(data.node).forEach(([key, value]) => {
    if (key === "sponsored_data") {
      const { ad_id, client_token } = value;
      const { fb_dtsg } = window.require("getAsyncParams")("POST");

      return _.assign(requestBody, {
        adId: ad_id,
        fields: { ad_id, client_token: client_token, fb_dtsg, request_id: "1" },
      });
    }
  });
};
