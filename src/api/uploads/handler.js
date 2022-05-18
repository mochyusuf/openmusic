const ClientError = require('../../exception/ClientError');

class UploadsHandler {
  constructor(service, validator, albumService2) {
    this._service = service;
    this._validator = validator;
    this._albumService = albumService2;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    try {
      const { cover } = request.payload;
      const { id } = request.params;
      console.log(this._validator.validateImageHeaders(cover.hapi.headers));

      const filename = await this._service.writeFile(cover, cover.hapi);
      const fileUrl = `http://${process.env.HOST}:${process.env.PORT}/file/${filename}`;
      await this._albumService.updateAlbumCover(id, fileUrl);

      const response = h.response({
        status: 'success',
        message: 'Cover berhasil diunggah',
      });
      response.code(201);
      return response;
    } catch (error) {
      console.log(error);
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      return response;
    }
  }
}

module.exports = UploadsHandler;
