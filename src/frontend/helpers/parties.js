export const availableCountries = [
  {id: 'GB', country: "Great Britain"},
  {id: 'DE', country: "Germany"},
  // {id: 'US', country: "USA"},
  // {id: 'HU', country: "Hungary"},
  // {id: 'CA', country: "Canada"},
]

export const availableParties = {
  'GB': [
      {entityId: 1, party:'Conservatives', shortName: 'CON', color: 'blue'},
      {entityId: 2, party:'The Labour Party', shortName: 'LAB', color: 'red'},
      {entityId: 3, party:'Liberal Democrats', shortName: 'LD', color: '#ffff00'},
      {entityId: 4, party:'UKIP', shortName: 'UKIP', color: 'purple'},
      {entityId: 5, party:'Scottish National Party', shortName: 'SNP', color: '#ffff00'},
      {entityId: 11, party:'The Green Party', shortName: 'Gre', color: 'green'},
      {entityId: 6, party:'Others', shortName: 'Oth', color: 'grey'},
      // test ids for FE extension
      // {entityId: 1000, party:'Very long party name', shortName: 'DC', color: 'blue'},
      // {entityId: 1001, party:'UA1', shortName: 'SMT', color: 'red'},
      // {entityId: 1002, party:'UA2', shortName: 'KLM', color: 'green'},
    ],
  'DE': [],
  // 'US': [
  //   {entityId: 7, party:'Democrat', shortName: 'Dem', color: 'blue'},
  //   {entityId: 8, party:'Republican', shortName: 'Rep', color: 'red'},
  //   {entityId: 9, party:'Libertarian', shortName: 'Lib', color: '#ffff00'},
  //   {entityId: 10, party:'Green', shortName: 'Gre', color: 'green'},
  // ],
  'HU': [
    {entityId: 12, party:'Fidesz', shortName: 'Fidesz', color: 'orange'},
    {entityId: 13, party:'Magyar Szocialista Párt', shortName: 'MSZP', color: 'red'},
    {entityId: 14, party:'Jobbik', shortName: 'Job', color: 'black'},
    {entityId: 16, party:'Demokratikus Koalíció', shortName: 'DK', color: 'blue'},
    {entityId: 17, party:'Együtt', shortName: 'Egy', color: '#ffff00'},
    {entityId: 18, party:'Párbeszéd', shortName: 'Pár', color: 'lightgreen'},
    {entityId: 20, party:'Más', shortName: 'Más', color: 'grey'},
    {entityId: 21, party:'LMP', shortName: 'LMP', color: 'lightgreen'},
  ],
  'CA': [
    {entityId: 22, party:'Liberal Party of Canada', shortName: 'Lib', color: 'red'},
    {entityId: 23, party:'Conservative Party of Canada', shortName: 'Con', color: 'blue'},
    {entityId: 24, party:'Green Party of Canada', shortName: 'Gre', color: 'green'},
    {entityId: 25, party:'New Democratic Party', shortName: 'NDP', color: 'orange'},
    {entityId: 26, party:'Bloc Québécois', shortName: 'Qué', color: 'lightblue'},
  ]
}
export const availablePages = {
  'GB': [
      {entityId: 1, pageId: '1348528641830572', pageOwner: 'Theresa May'},
      {entityId: 1, pageId:'2324252', pageOwner:'Conservatives'},
      {entityId: 2, pageId:'25749647410', pageOwner:'The Labour Party'},
      {entityId: 2, pageId:'330250343871', pageOwner:'Jeremy Corbyn'},
      {entityId: 3, pageId:'5883973269', pageOwner:'Liberal Democrats'},
      {entityId: 3, pageId:'405046796227418', pageOwner:'Vince Cable MP'},
      {entityId: 4, pageId:'209101162445115', pageOwner:'UKIP'},
      {entityId: 5, pageId:'77249349077', pageOwner:'SNP'},
      {entityId: 5, pageId:'143272075714717', pageOwner:'Nicola Sturgeon'},
      {entityId: 11, pageId:'20995300784', pageOwner:'The Green Party'},
      {entityId: 11, pageId:'17999726169', pageOwner:'Scottish Green Party'},
      {entityId: 11, pageId:'8948360263', pageOwner:'Caroline Lucas'},
      {entityId: 11, pageId:'263474960410377', pageOwner:'Jonathan Bartley'},
      {entityId: 6, pageId:'105732052794210', pageOwner:'DUP'},
      {entityId: 6, pageId:'984945704933234', pageOwner:'Arlene Foster'},
      {entityId: 6, pageId:'148726998530273', pageOwner:'Sinn Fein'},
      {entityId: 6, pageId:'26416930992', pageOwner:'Plaid Cymru'},
      {entityId: 6, pageId:'463813337026688', pageOwner:'Leanne Wood'},
      {entityId: 6, pageId:'1599273957019493', pageOwner:'Sylvia Hermon'},
      //Test ids GB for FE extension
      {entityId: 1, pageId:'282592881929497', pageOwner:'Huel'},
      {entityId: 2, pageId:'10677003998', pageOwner:'Shelter'},
      {entityId: 3, pageId:'139767333028906', pageOwner:'Simba'},
      {entityId: 4, pageId:'7715002593', pageOwner:'UNICEF UK'},
      {entityId: 5, pageId:'215710275128064', pageOwner:'Nutmeg'},
      {entityId: 5, pageId:'117476785190', pageOwner:'Save the Children UK'},
      {entityId: 6, pageId:'143844865793', pageOwner:'Accenture UK'},
      {entityId: 6, pageId:'61675732935', pageOwner:'Zendesk'},
      {entityId: 11, pageId:'1238374586212820', pageOwner:'Promo'},
      {entityId: 11, pageId:'7527864602', pageOwner:'WaterAid UK'},
      // test ids for FE extension
      {entityId: 1, pageId:"726282547396228", pageOwner:"DataCamp"},
      {entityId: 2, pageId:"926577417485565", pageOwner:"Mac"},
      {entityId: 3, pageId:"323378314447406", pageOwner:"Hillel"},
      {entityId: 4, pageId:"498564336908383", pageOwner:"Crossover"},
      {entityId: 5, pageId:"100858346620905", pageOwner:"Udemy"},
      {entityId: 6, pageId:"1094324843916090", pageOwner:"WAD"},
      {entityId: 11, pageId:"717433145028974", pageOwner:"Piknik"},
      {entityId: 11, pageId:"204850869545274", pageOwner:"KLM"},
      {entityId: 11, pageId:"89654856679", pageOwner:"GetSmarter"},
    ],
    'DE': [],
    // 'US': [
    //
    //   ],
    'HU': [
        {entityId: 12, pageId:"132847300676208", pageOwner:"Fidesz"},
        {entityId: 12, pageId:"298090296092", pageOwner:"Viktor Orban"},
        {entityId: 13, pageId:"115388925185513", pageOwner:"MSZP"},
        {entityId: 14, pageId:"287770891404", pageOwner:"Jobbik"},
        {entityId: 16, pageId:"169599166463839", pageOwner:"DK"},
        {entityId: 17, pageId:"278219632295951", pageOwner:"Együtt"},
        {entityId: 18, pageId:"113684438795574", pageOwner:"Párbeszéd"},
        {entityId: 20, pageId:"", pageOwner:""},
        {entityId: 21, pageId:"47198507012", pageOwner:"LMP"},
      ],
    'CA': [

      ],
}
