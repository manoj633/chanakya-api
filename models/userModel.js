import mongoose from "mongoose";

const { Schema } = mongoose;

const addressSchema = new Schema(
  {
    region: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    street: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  address: {
    type: addressSchema,
    required: true,
  },
  location: {
    type: String,
  },
  phone: {
    type: String,
    required: true,
  },
  alternatePhone: {
    type: String,
  },
  role: {
    type: String,
    required: true,
    enum: ["admin", "agent", "customer"],
    default: "customer",
  },
  verified: {
    type: Boolean,
    default: false,
  },
  joinedOn: {
    type: Date,
    required: true,
  },
  manufacturerId: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return /^[0-9]{5}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid 5-digit number!`,
    },
  },
  wholesalerId: {
    type: Number,
    required: true,
    validate: {
      validator: function (v) {
        return /^[0-9]{5}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid 5-digit number!`,
    },
  },
  GSTno: {
    type: String,
    required: true,
  },
  blocked: {
    type: Boolean,
    required: true,
    default: false,
  },
  brandName: {
    type: String,
    required: true,
  },
  shopName: {
    type: String,
    required: true,
  },
  vehicleNumber: {
    type: String,
  },
  salesRegion: {
    type: [String],
    required: true,
  },
});

const User = mongoose.model("User", UserSchema);

export default User;
