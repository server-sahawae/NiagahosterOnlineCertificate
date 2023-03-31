const { CertificateTemplate } = require("../models");

module.exports = class Controller {
  static async patchCertificateTemplate(req, res, next) {
    try {
      const { id } = req.headers;
      const {
        namePosition,
        statusPosition,
        QRx,
        QRy,
        EventId,
        LogoId,
        signName,
      } = req.body;
      const data = await CertificateTemplate.update(
        { ...req.body },
        { where: { id } }
      );
      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
};
