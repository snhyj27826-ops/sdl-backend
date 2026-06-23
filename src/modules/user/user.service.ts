import { Injectable } from '@nestjs/common';
import { User, UserDocument } from './user.schema';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async findOne(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async create(userData: any): Promise<User> {
    const { email, password, ...rest } = userData;
    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({
      email,
      password: hashPassword,
      ...rest,
    });
    return newUser.save();
  }

  async findAll() {
    return this.userModel.find().exec();
  }
}
