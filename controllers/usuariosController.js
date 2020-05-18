const Usuarios = require("../models/Usuarios");
const colors = require("colors");
const enviarEmail = require("../handlers/email");

exports.formCrearCuenta = (req, res) => {
  res.render("crearCuenta", {
    nombrePagina: "Crear cuenta en UpTask",
  });
};

exports.formIniciarSesion = (req, res) => {
  const { error } = res.locals.mensajes;

  res.render("iniciarSesion", {
    nombrePagina: "Iniciar Sesión en UpTask",
    error,
  });
};

exports.crearCuenta = async (req, res) => {
  const { email, password } = req.body;

  try {
    await Usuarios.create({
      email,
      password,
    });

    //Crear activación por correo
    const confirmarUrl = `http://${req.headers.host}/confirmar/${email}`;
    const usuario = {
      email,
    };
    console.log("llega aqui?".yellow);

    await enviarEmail.enviar({
      usuario,
      subject: "Confirma tu cuenta UpTask",
      confirmarUrl,
      archivo: "confirma-cuenta.pug",
    });

    req.flash("correcto", "Enviamos un correo, confirma tu cuenta");
    res.redirect("/iniciar-sesion");
  } catch (error) {
    console.log(colors.red(error));
    req.flash(
      "error",
      error.errors.map((error) => error.message)
    );
    res.render("crearCuenta", {
      mensajes: req.flash(),
      nombrePagina: "Crear cuenta en UpTask",
      email,
      password,
    });
  }
};

exports.formRestablecerPassword = (req, res) => {
  res.render("reestablecer", {
    nombrePagina: "Reestablecer tu Contraseña",
  });
};

exports.confirmarCuenta = async (req, res) => {
  const usuario = await Usuarios.findOne({
    where: {
      email: req.params.correo,
    },
  });

  if (!usuario) {
    req.flash("error", "No válido");
    res.redirect("/crear-cuenta");
  }

  usuario.activo = 1;
  await usuario.save();
  req.flash("correcto", "Cuenta activada correctamente");
  res.redirect("/iniciar-sesion");
};
