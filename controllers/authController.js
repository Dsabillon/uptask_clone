const passport = require("passport");
const crypto = require("crypto");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const bcrypt = require("bcrypt-nodejs");
const enviarEmail = require("../handlers/email");
const Usuarios = require("../models/Usuarios");

exports.autenticarUsuario = passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/iniciar-sesion",
  failureFlash: true,
  badRequestMessage: "Ambos campos son obligatorios",
});

exports.usuarioAutenticado = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }

  return res.redirect("/iniciar-sesion");
};

exports.cerrarSesion = (req, res) => {
  req.session.destroy(() => {
    res.redirect("/iniciar-sesion");
  });
};

exports.enviarToken = async (req, res) => {
  const { email } = req.body;
  const usuario = await Usuarios.findOne({ where: { email } });

  if (!usuario) {
    req.flash("error", "No existe esa cuenta");
    res.redirect("/reestablecer");
  }
  //Token y su expiración
  usuario.token = crypto.randomBytes(20).toString("hex");
  usuario.expiracion = Date.now() + 3600000;

  await usuario.save();

  const resetUrl = `http://${req.headers.host}/reestablecer/${usuario.token}`;

  //Envia el correo con el token
  await enviarEmail.enviar({
    usuario,
    subject: "Password Reset",
    resetUrl,
    archivo: "reestablecer-password.pug",
  });

  req.flash("correcto", "Se envió un mensaje a tu correo");
  res.redirect("/iniciar-sesion");
};

exports.validarToken = async (req, res) => {
  const usuario = await Usuarios.findOne({
    where: {
      token: req.params.token,
    },
  });

  if (!usuario) {
    req.flash("error", "No válido");
    res.redirect("/reestablecer");
  }

  res.render("resetPassword", {
    nombrePagina: "Reestablecer Contraseña",
  });
};

exports.actualizarPassword = async (req, res) => {
  //Verifica token válido y fecha de expiración
  const usuario = await Usuarios.findOne({
    where: {
      token: req.params.token,
      expiracion: {
        [Op.gte]: Date.now(),
      },
    },
  });

  if (!usuario) {
    req.flash("error", "No Válido");
    res.redirect("/reestablecer");
  }

  usuario.password = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10));
  usuario.token = null;
  usuario.expiracion = null;
  await usuario.save();
  req.flash("correcto", "Tu password se ha modificado correctamente");
  res.redirect("/iniciar-sesion");
};
