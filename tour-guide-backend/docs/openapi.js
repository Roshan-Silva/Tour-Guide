const json = (schema) => ({ 'application/json': { schema } });
const errors = { 400:{description:'Invalid request'},401:{description:'Authentication required'},403:{description:'Insufficient permission'},404:{description:'Not found'},409:{description:'State conflict'},422:{description:'Validation failed'},500:{description:'Unexpected server error'} };
const security = [{ bearerAuth: [] }];
const id = { in:'path', name:'id', required:true, schema:{type:'string'} };

export default {
  openapi: '3.0.3',
  info: { title:'Ceylon Explorer API', version:'6.0.0', description:'Travel planning and direct traveler-to-driver bookings with post-tour driver commissions. Ceylon Explorer does not collect tour payments.' },
  servers: [{ url:'/api', description:'Current server' }],
  tags: ['Auth','Destinations','Drivers','Trip Planner','Bookings','Commissions','Favorites','Reviews','Driver Portal','Admin'].map((name)=>({name})),
  components: {
    securitySchemes: { bearerAuth:{type:'http',scheme:'bearer',bearerFormat:'JWT'},refreshCookie:{type:'apiKey',in:'cookie',name:'refreshToken'} },
    schemas: {
      Auth:{type:'object',required:['email','password'],properties:{email:{type:'string',format:'email'},password:{type:'string',format:'password',minLength:8}}},
      Booking:{type:'object',required:['driverId','destination','startDate','endDate','partySize'],properties:{driverId:{type:'string'},destination:{type:'string'},startDate:{type:'string',format:'date'},endDate:{type:'string',format:'date'},partySize:{type:'integer'},notes:{type:'string'},itineraryId:{type:'string'}}},
      Commission:{type:'object',properties:{booking:{type:'string'},driver:{type:'string'},agreedTourPrice:{type:'integer',description:'LKR minor units paid directly to driver'},commissionRateBps:{type:'integer',example:200},commissionAmount:{type:'integer'},status:{type:'string',enum:['due','payment_submitted','paid','overdue','waived','disputed']},dueAt:{type:'string',format:'date-time'},paymentReference:{type:'string'}}},
    },
  },
  paths: {
    '/auth/register':{post:{tags:['Auth'],summary:'Register traveler',responses:{201:{description:'Account created'},...errors}}},
    '/auth/register-driver':{post:{tags:['Auth'],summary:'Apply as driver with protected NIC and licence',responses:{201:{description:'Application submitted'},...errors}}},
    '/auth/login':{post:{tags:['Auth'],summary:'Create access and refresh session',requestBody:{required:true,content:json({$ref:'#/components/schemas/Auth'})},responses:{200:{description:'Signed in'},...errors}}},
    '/auth/refresh':{post:{tags:['Auth'],summary:'Rotate refresh token',security:[{refreshCookie:[]}],responses:{200:{description:'Session refreshed'},...errors}}},
    '/places':{get:{tags:['Destinations'],summary:'Search active destinations',responses:{200:{description:'Destination list'}}}},
    '/places/{slug}':{get:{tags:['Destinations'],summary:'Destination detail',parameters:[{in:'path',name:'slug',required:true,schema:{type:'string'}}],responses:{200:{description:'Destination detail'},...errors}}},
    '/drivers':{get:{tags:['Drivers'],summary:'Find verified, available, unrestricted drivers',responses:{200:{description:'Public driver list'},...errors}}},
    '/drivers/{id}':{get:{tags:['Drivers'],summary:'Public driver detail without private contact or identity values',parameters:[id],responses:{200:{description:'Driver and reviews'},...errors}}},
    '/bookings/add':{post:{tags:['Bookings'],summary:'Create pending direct-payment booking',security,requestBody:{required:true,content:json({$ref:'#/components/schemas/Booking'})},responses:{201:{description:'Pending booking created'},...errors}}},
    '/bookings/mine':{get:{tags:['Bookings'],summary:'List traveler bookings',security,responses:{200:{description:'Owned bookings'},...errors}}},
    '/bookings/{id}/complete':{patch:{tags:['Bookings'],summary:'Traveler or admin completes an ended tour',security,parameters:[id],responses:{200:{description:'Completed with commission'},...errors}}},
    '/driver/bookings/{id}/accept':{patch:{tags:['Driver Portal'],summary:'Accept and immediately confirm pending booking',security,parameters:[id],responses:{200:{description:'Booking confirmed'},...errors}}},
    '/driver/bookings/{id}/complete':{patch:{tags:['Driver Portal'],summary:'Complete an ended assigned tour',security,parameters:[id],responses:{200:{description:'Completed with commission'},...errors}}},
    '/driver/commissions':{get:{tags:['Commissions'],summary:'List own commissions and standing',security,responses:{200:{description:'Commission account'},...errors}}},
    '/driver/commissions/{id}/submit-payment':{post:{tags:['Commissions'],summary:'Submit manual bank-transfer reference for admin review',security,parameters:[id],responses:{200:{description:'Payment proof submitted'},...errors}}},
    '/admin/commissions':{get:{tags:['Admin'],summary:'List and filter all commissions',security,responses:{200:{description:'Commission list'},...errors}}},
    '/admin/commissions/{id}':{get:{tags:['Admin'],summary:'Get one commission',security,parameters:[id],responses:{200:{description:'Commission detail'},...errors}}},
    '/admin/commissions/{id}/approve-payment':{patch:{tags:['Admin'],summary:'Verify submitted commission payment',security,parameters:[id],responses:{200:{description:'Commission marked paid'},...errors}}},
    '/admin/commissions/{id}/reject-payment':{patch:{tags:['Admin'],summary:'Reject submitted proof',security,parameters:[id],responses:{200:{description:'Commission returned to due or overdue'},...errors}}},
    '/admin/commissions/{id}/waive':{patch:{tags:['Admin'],summary:'Waive commission with reason',security,parameters:[id],responses:{200:{description:'Commission waived'},...errors}}},
    '/drivers/admin/{id}/identity':{
      get:{tags:['Admin'],summary:'Reveal encrypted driver identity and audit access',security,parameters:[id],responses:{200:{description:'Plain values for authorized review'},...errors}},
      put:{tags:['Admin'],summary:'Store and verify protected driver identity',security,parameters:[id],responses:{200:{description:'Identity verified'},...errors}},
    },
    '/favorites':{get:{tags:['Favorites'],summary:'List saved destinations',security,responses:{200:{description:'Favorites'},...errors}}},
    '/reviews':{post:{tags:['Reviews'],summary:'Review completed owned booking',security,responses:{201:{description:'Review created'},...errors}}},
    '/admin/dashboard':{get:{tags:['Admin'],summary:'Admin operational dashboard',security,responses:{200:{description:'Dashboard'},...errors}}},
  },
};
