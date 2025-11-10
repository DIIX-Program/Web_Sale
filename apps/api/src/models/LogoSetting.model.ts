import mongoose, { Document, Schema } from 'mongoose';

export interface ILogoSetting extends Document {
  imageUrl: string;
  updatedBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const logoSettingSchema = new Schema<ILogoSetting>(
  {
    imageUrl: {
      type: String,
      required: true,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

const LogoSetting = mongoose.model<ILogoSetting>('LogoSetting', logoSettingSchema);

export default LogoSetting;

