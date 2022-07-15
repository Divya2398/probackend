const joi = require("joi");

const usertestSchema = joi.object({
  Name: joi
    .string()
    .pattern(new RegExp(/^[A-Z][a-zA-Z '.-]*$/))
    .min(3)
    .max(30)
    .required(),
  UserName: joi
    .string()
    .pattern(new RegExp(/^[a-zA-Z0-9#!@$^&*-]*$/))
    .min(3)
    .max(20)
    .required(),
  Email: joi.string().email().lowercase().required(),
  Mobilenumber: joi
    .string()
    .length(10)
    .pattern(new RegExp(/^[0-9]+$/))
    .required(),
  password: joi
    .string()
    .min(8)
    .pattern(
      new RegExp(
        /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/
      )
    )
    .required(),
});

module.exports = {
  usertestSchema: usertestSchema,
};
