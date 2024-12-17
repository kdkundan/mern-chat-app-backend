import mongoose, { Schema, Model, Document } from "mongoose";
import map from "mongoose-autopopulate";

interface IModel extends Document {
  [key: string]: any;
  deleted?: boolean;
}

const getSchema = (model: Record<string, any>): Schema<IModel> => {
  const modelSchema = new Schema<IModel>(
    {
      ...model,
      deleted: { type: Boolean, default: false },
    },
    {
      toJSON: { virtuals: true },
      toObject: { virtuals: true },
      timestamps: true,
    }
  );
  modelSchema.index({ "$**": "text" });
  modelSchema.plugin(map);
  return modelSchema;
};

// The createModel function takes a model object, the name of the model, and an optional dbName.
// It returns a Model instance.
export const createModel = (
  model: Record<string, any>,
  name: string,
  dbName?: string
): Model<IModel> => mongoose.model<IModel>(name, getSchema(model), dbName);

// The saveModel function takes a Model and data to be saved. It returns a Promise of the saved document.
export const saveModel = (
  Model: Model<IModel>,
  data: Record<string, any>
): Promise<IModel> => new Model(data).save();
