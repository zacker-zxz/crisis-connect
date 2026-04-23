import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['ngo', 'volunteer'], required: true },
  skills: [{ type: String }],
  organizationName: { type: String },
  publicDescription: { type: String },
  profileImageUrl: { type: String },
  availability: [{
    day: { type: String },
    enabled: { type: Boolean },
    start: { type: String },
    end: { type: String },
  }],
  location: {
    lat:     { type: Number },
    lng:     { type: Number },
    address: { type: String }
  },
}, { timestamps: true });

const TaskSchema = new Schema({
  ngoId:              { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title:              { type: String, required: true },
  description:        { type: String, required: true },
  requiredVolunteers: { type: Number, required: true },
  filledVolunteers:   { type: Number, default: 0 },
  assignedVolunteers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  requiredSkills:     [{ type: String }],
  priority:           { type: String, enum: ['Critical', 'Urgent', 'Medium', 'Low'], default: 'Medium' },
  location: {
    lat:     { type: Number, required: true },
    lng:     { type: Number, required: true },
    address: { type: String, required: true }
  },
  status:   { type: String, enum: ['Open', 'In Progress', 'Completed'], default: 'Open' },
  dateTime: { type: Date, required: true }
}, { timestamps: true });

const NGORequestSchema = new Schema({
  ngoId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  volunteerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, default: '' },
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
}, { timestamps: true });

export const User = models.User || model('User', UserSchema);
export const Task = models.Task || model('Task', TaskSchema);
export const NGORequest = models.NGORequest || model('NGORequest', NGORequestSchema);
