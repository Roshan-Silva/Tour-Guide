import mongoose from 'mongoose';
const schema=new mongoose.Schema({
 booking:{type:mongoose.Schema.Types.ObjectId,ref:'Booking',required:true,unique:true,index:true},driver:{type:mongoose.Schema.Types.ObjectId,ref:'Driver',required:true,index:true},
 agreedTourPrice:{type:Number,required:true,min:0},commissionRateBps:{type:Number,required:true,min:0,max:10000},commissionAmount:{type:Number,required:true,min:0},currency:{type:String,enum:['LKR'],default:'LKR'},
 status:{type:String,enum:['pending','due','payment_submitted','paid','overdue','waived','disputed'],default:'due',index:true},tourEndedAt:{type:Date,required:true},generatedAt:{type:Date,default:Date.now},dueAt:{type:Date,required:true,index:true},submittedAt:Date,paidAt:Date,overdueAt:Date,paymentMethod:{type:String,enum:['manual_bank','future_gateway'],default:'manual_bank'},paymentReference:{type:String,trim:true,maxlength:120},driverNote:{type:String,trim:true,maxlength:500},adminNotes:{type:String,trim:true,maxlength:1000},
},{timestamps:true});
export default mongoose.model('Commission',schema);
