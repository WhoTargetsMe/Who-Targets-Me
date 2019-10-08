// For development => PageResults.js
// componentWillMount() {
//   this.refreshUserData();
  // for development
  // let filters = {}
  // const _filters = mockdata.data.filters;
  // Object.keys(_filters).forEach(key => { //response.jsonData.data.userData
  //   let lst = []
  //   _filters[key].forEach(obj => {
  //     const partyDetails = availableParties[mockdata.data.country].filter(p => obj.party.toLowerCase() === p.shortName.toLowerCase())[0];
  //     const res = Object.assign({}, obj, {partyDetails: partyDetails});
  //     lst.push(res);
  //   })
  //   filters[key] = lst;
  // })
  // this.setState({userData: mockdata.data, filters, language: 'en'})
// }

export const mockdata = {
    "status": "success",
    "data": {
        "age": 30,
        "gender": 1,
        "country": "GB",
        "postcode": "",
        "userCount": 10000,
        "constituency": null,
        "advertisers": [
            {
                "advertiserName": "The Labour Party",
                "advertiserId": "25749647410",
                "party": "LAB",
                "count": 18
            },
            {
                "advertiserName": "Jeremy Corbyn",
                "advertiserId": "330250343871",
                "party": "LAB",
                "count": 9
            },
            {
                "advertiserName": "Conservatives",
                "advertiserId": "8807334278",
                "party": "CON",
                "count": 4
            },
            {
                "advertiserName": "People's Vote UK",
                "advertiserId": "748608695327755",
                "party": "Remain",
                "count": 3
            },
            {
                "advertiserName": "Theresa May",
                "advertiserId": "1348528641830572",
                "party": "CON",
                "count": 1
            }
        ],
        "filters": {
            "country": [
                {
                    "party": "LAB",
                    "count": 2727,
                    "percentage": "38.9"
                },
                {
                    "party": "Remain",
                    "count": 2416,
                    "percentage": "34.5"
                },
                {
                    "party": "LD",
                    "count": 1090,
                    "percentage": "15.6"
                },
                {
                    "party": "CON",
                    "count": 399,
                    "percentage": "5.7"
                },
                {
                    "party": "Gre",
                    "count": 216,
                    "percentage": "3.1"
                },
                {
                    "party": "Leave",
                    "count": 78,
                    "percentage": "1.1"
                },
                {
                    "party": "PC",
                    "count": 38,
                    "percentage": "0.5"
                },
                {
                    "party": "SNP",
                    "count": 25,
                    "percentage": "0.4"
                },
                {
                    "party": "UKIP",
                    "count": 7,
                    "percentage": "0.1"
                },
                {
                    "party": "NI",
                    "count": 6,
                    "percentage": "0.1"
                },
                {
                    "party": "Oth",
                    "count": 4,
                    "percentage": "0.1"
                }
            ],
            "geo": [],
            "age_lt45": [
                {
                    "party": "Remain",
                    "count": 537,
                    "percentage": "39.4"
                },
                {
                    "party": "LAB",
                    "count": 406,
                    "percentage": "29.8"
                },
                {
                    "party": "LD",
                    "count": 201,
                    "percentage": "14.7"
                },
                {
                    "party": "CON",
                    "count": 78,
                    "percentage": "5.7"
                },
                {
                    "party": "Gre",
                    "count": 42,
                    "percentage": "3.1"
                },
                {
                    "party": "Leave",
                    "count": 40,
                    "percentage": "2.9"
                },
                {
                    "party": "PC",
                    "count": 30,
                    "percentage": "2.2"
                },
                {
                    "party": "SNP",
                    "count": 17,
                    "percentage": "1.2"
                },
                {
                    "party": "UKIP",
                    "count": 7,
                    "percentage": "0.5"
                },
                {
                    "party": "NI",
                    "count": 5,
                    "percentage": "0.4"
                }
            ],
            "age_gt45": [
                {
                    "party": "Remain",
                    "count": 404,
                    "percentage": "36.9"
                },
                {
                    "party": "LD",
                    "count": 306,
                    "percentage": "27.9"
                },
                {
                    "party": "LAB",
                    "count": 258,
                    "percentage": "23.5"
                },
                {
                    "party": "CON",
                    "count": 98,
                    "percentage": "8.9"
                },
                {
                    "party": "Gre",
                    "count": 15,
                    "percentage": "1.4"
                },
                {
                    "party": "Leave",
                    "count": 10,
                    "percentage": "0.9"
                },
                {
                    "party": "PC",
                    "count": 3,
                    "percentage": "0.3"
                },
                {
                    "party": "Oth",
                    "count": 2,
                    "percentage": "0.2"
                }
            ],
            "sex_male": [
                {
                    "party": "Remain",
                    "count": 713,
                    "percentage": "37.6"
                },
                {
                    "party": "LD",
                    "count": 459,
                    "percentage": "24.2"
                },
                {
                    "party": "LAB",
                    "count": 434,
                    "percentage": "22.9"
                },
                {
                    "party": "CON",
                    "count": 161,
                    "percentage": "8.5"
                },
                {
                    "party": "Leave",
                    "count": 50,
                    "percentage": "2.6"
                },
                {
                    "party": "Gre",
                    "count": 29,
                    "percentage": "1.5"
                },
                {
                    "party": "PC",
                    "count": 22,
                    "percentage": "1.2"
                },
                {
                    "party": "SNP",
                    "count": 17,
                    "percentage": "0.9"
                },
                {
                    "party": "UKIP",
                    "count": 7,
                    "percentage": "0.4"
                },
                {
                    "party": "NI",
                    "count": 3,
                    "percentage": "0.2"
                },
                {
                    "party": "Oth",
                    "count": 2,
                    "percentage": "0.1"
                }
            ],
            "sex_female": [
                {
                    "party": "Remain",
                    "count": 223,
                    "percentage": "43.9"
                },
                {
                    "party": "LAB",
                    "count": 191,
                    "percentage": "37.6"
                },
                {
                    "party": "LD",
                    "count": 38,
                    "percentage": "7.5"
                },
                {
                    "party": "Gre",
                    "count": 28,
                    "percentage": "5.5"
                },
                {
                    "party": "CON",
                    "count": 15,
                    "percentage": "3.0"
                },
                {
                    "party": "PC",
                    "count": 11,
                    "percentage": "2.2"
                },
                {
                    "party": "NI",
                    "count": 2,
                    "percentage": "0.4"
                }
            ],
            "polit_left": [
                {
                    "party": "Remain",
                    "count": 769,
                    "percentage": "42.7"
                },
                {
                    "party": "LAB",
                    "count": 555,
                    "percentage": "30.8"
                },
                {
                    "party": "LD",
                    "count": 235,
                    "percentage": "13.1"
                },
                {
                    "party": "CON",
                    "count": 118,
                    "percentage": "6.6"
                },
                {
                    "party": "Gre",
                    "count": 51,
                    "percentage": "2.8"
                },
                {
                    "party": "PC",
                    "count": 31,
                    "percentage": "1.7"
                },
                {
                    "party": "Leave",
                    "count": 20,
                    "percentage": "1.1"
                },
                {
                    "party": "SNP",
                    "count": 17,
                    "percentage": "0.9"
                },
                {
                    "party": "Oth",
                    "count": 2,
                    "percentage": "0.1"
                },
                {
                    "party": "NI",
                    "count": 2,
                    "percentage": "0.1"
                }
            ],
            "polit_right": [
                {
                    "party": "Remain",
                    "count": 183,
                    "percentage": "57.7"
                },
                {
                    "party": "LD",
                    "count": 46,
                    "percentage": "14.5"
                },
                {
                    "party": "Leave",
                    "count": 29,
                    "percentage": "9.1"
                },
                {
                    "party": "LAB",
                    "count": 25,
                    "percentage": "7.9"
                },
                {
                    "party": "CON",
                    "count": 17,
                    "percentage": "5.4"
                },
                {
                    "party": "UKIP",
                    "count": 7,
                    "percentage": "2.2"
                },
                {
                    "party": "SNP",
                    "count": 4,
                    "percentage": "1.3"
                },
                {
                    "party": "NI",
                    "count": 3,
                    "percentage": "0.9"
                },
                {
                    "party": "Oth",
                    "count": 2,
                    "percentage": "0.6"
                },
                {
                    "party": "Gre",
                    "count": 1,
                    "percentage": "0.3"
                }
            ]
        }
    }
}
