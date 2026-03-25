// import mongoose,{Schema} from "mongoose";
// const accountSchema = new mongoose.Schema({
//   userId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User',
//     required: true
//   },
//   bankName: {
//     type: String,
//     required: true,
//     enum: ['SBI', 'HDFC', 'ICICI', 'AXIS', 'PNB'] // Restricted to supported banks
//   },
//   accountNumber: {
//     type: String,
//     required: true,
//     unique: true
//   },
//   ifscCode: {
//     type: String,
//     required: true,
//     uppercase: true
//   },
//   balance: {
//     type: Number,
//     required: true,
//     default: 0,
//     min: 0
//   },
//   isPrimary: {
//     type: Boolean,
//     default: false
//   }
// }, 
// { timestamps: true });

// export const Account = mongoose.model('Account', accountSchema);





import mongoose, { Schema } from "mongoose";

const accountSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    bankName: { type: String, required: true },
    accountNumber: { type: String, required: true, unique: true },
    ifscCode: { type: String, required: true, uppercase: true },
    balance: { type: Number, required: true, default: 0, min: 0 },
    isPrimary: { type: Boolean, default: false }
}, { timestamps: true });

export const Account = mongoose.model('Account', accountSchema);