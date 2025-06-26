const mongoose =require('mongoose');
const bcrypt =require('bcryptjs');

//User Schema
const userSchema = new mongoose.Schema({
      name: { type: String, required: true },
    email: { type: String, required: true, unique: true, match: [/.+\@.+\..+/, 'Por favor, insira um e-mail válido']  },// Validação de e-mail
    password: {type: String, required: true},

});




//Hash da senha antes do usuario salvar

userSchema.pre('save', async function (next) {

if(!this.isModified('password')) return next();

const salt = await bcrypt.genSalt(10);

this.password = await bcrypt.hash(this.password, salt);

next();
});

//Compara senha

userSchema.methods.matchPassword = async function (enteredPassword) {

return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
