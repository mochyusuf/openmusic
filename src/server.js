require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const path = require('path');

const album = require('./api/album');
const song = require('./api/song');
const users = require('./api/users');
const authentication = require('./api/authentication');
const TokenManager = require('./tokenize/tokenManager');
const playlist = require('./api/playlist');
const collaboration = require('./api/collaboration');
const exportss = require('./api/exports');
const uploads = require('./api/uploads');

const AlbumsService = require('./services/albumService');
const SongService = require('./services/songService');
const UsersService = require('./services/usersService');
const AuthenticationService = require('./services/authenticationService');
const PlaylistService = require('./services/playlistService');
const PlaylistSongService = require('./services/playlistSongService');
const CollaborationService = require('./services/collaborationService');

const AlbumValidator = require('./validator/album');
const SongValidator = require('./validator/song');
const UsersValidator = require('./validator/users');
const AuthenticationValidator = require('./validator/authentication');
const PlaylistValidator = require('./validator/playlist');
const CollaborationValidator = require('./validator/collaboration');
const ExportsValidator = require('./validator/exports');
const UploadsValidator = require('./validator/uploads');

const ProducerService = require('./services/ProducerService');
const StorageService = require('./services/StorageService');

const ClientError = require('./exception/ClientError');

const init = async () => {
  const albumService = new AlbumsService();
  const songService = new SongService();
  const usersService = new UsersService();
  const collaborationService = new CollaborationService();
  const authenticationService = new AuthenticationService();
  const playlistService = new PlaylistService();
  const playlistSongService = new PlaylistSongService();
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file'));

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof ClientError) {
      const newResponse = h.response({
        status: 'fail',
        message: response.message,
      });
      newResponse.code(response.statusCode);
      return newResponse;
    } if (response instanceof Error) {
      console.log(response);
      const { statusCode, payload } = response.output;
      if (statusCode === 401) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(401);
        return newResponse;
      }
      if (statusCode === 404) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(404);
        return newResponse;
      }
      if (statusCode === 413) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(413);
        return newResponse;
      }
      const newResponse = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      newResponse.code(500);
      return newResponse;
    }
    return response.continue || response;
  });

  await server.register([
    {
      plugin: album,
      options: {
        service: albumService,
        validator: AlbumValidator,
      },
    },
    {
      plugin: song,
      options: {
        service: songService,
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentication,
      options: {
        authenticationService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationValidator,
      },
    },
    {
      plugin: playlist,
      options: {
        playlistService,
        songService,
        playlistSongService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: collaboration,
      options: {
        collaborationService,
        playlistService,
        validator: CollaborationValidator,
        usersService,
      },
    },
    {
      plugin: exportss,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistService,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
        albumService2: albumService,
      },
    },
  ]);

  await server.start();
  console.log(`Server berjalan pada ${server.info.uri}`);
};

init();
