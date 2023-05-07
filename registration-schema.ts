import * as Yup from "yup"

const RegistrationSchema = Yup.object().shape({
    email: Yup.string().email().required('Required'),
    first_name: Yup.string().required(),
    last_name: Yup.string().required(),
    password: Yup.string()
        .min(8, "Длина пароля должна быть не менее 8 символов")
        .matches(/^.*(?=.*[a-z])(?=.*\d).*$/, "Пароль должен содержать латиницу и как минимум одну цифру")
        .required("Required"),
    password_double: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Пароли должны совпадать')
})

export default RegistrationSchema;