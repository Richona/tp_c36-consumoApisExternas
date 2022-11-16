const path = require('path');
const db = require('../../database/models');
const sequelize = db.sequelize;
const { Op } = require("sequelize");
const moment = require('moment');


//Aqui tienen otra forma de llamar a cada uno de los modelos
const Movies = db.Movie;
const Genres = db.Genre;
const Actors = db.Actor;


const moviesAPIController = {
    'list': async (req, res) => {
        try {
            let movies = await db.Movie.findAll()

            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    total: movies.length,
                    url: 'api/movies'
                },
                data: movies
            })
        } catch (error) {
            console.log(error)
            const showErrors = error.errors.map(error => {
                return {
                    path: error.path,
                    message: error.message
                }
            })

            return res.status(error.status || 500).json({
                ok: false,
                status: error.status || 500,
                errors: showErrors,
            })
        }

    },

    'detail': async (req, res) => {
        try {
            let movie = await db.Movie.findByPk(req.params.id, { include: ['genre'] })

            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    total: movie.length,
                    url: 'api/movies/:id'
                },
                data: movie
            })
        } catch (error) {
            console.log(error)
            const showErrors = error.errors.map(error => {
                return {
                    path: error.path,
                    message: error.message
                }
            })

            return res.status(error.status || 500).json({
                ok: false,
                status: error.status || 500,
                errors: showErrors,
            })
        }
    },
    'recomended': (req, res) => {
        db.Movie.findAll({
            include: ['genre'],
            where: {
                rating: { [db.Sequelize.Op.gte]: req.params.rating }
            },
            order: [
                ['rating', 'DESC']
            ]
        })
            .then(movies => {
                let respuesta = {
                    meta: {
                        status: 200,
                        total: movies.length,
                        url: 'api/movies/recomended/:rating'
                    },
                    data: movies
                }
                res.json(respuesta);
            })
            .catch(error => console.log(error))
    },
    create: async (req, res) => {
        try {
            const { title, rating, awards, release_date, length, genre_id } = req.body;

            const movie = await db.Movie.create({
                title: title?.trim(),
                rating,
                awards,
                release_date,
                length,
                genre_id
            })

            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    total: movie.length,
                    url: 'api/movies/create'
                },
                msg: "Pelicula creada con exito",
                data: {
                    movie
                }
            })

        } catch (error) {
            console.log(error)
            const showErrors = error.errors.map(error => {
                return {
                    path: error.path,
                    message: error.message
                }
            })

            return res.status(error.status || 500).json({
                ok: false,
                status: error.status || 500,
                errors: showErrors,
            })
        }
    },
    update: async (req, res) => {
        const { title, rating, awards, release_date, length, genre_id } = req.body;

        try {
            let movieId = req.params.id;
            let movie = await db.Movie.findByPk(movieId);

            movie.title = title?.trim() || movie.title;
            movie.rating = rating || movie.rating
            movie.awards = awards || movie.awards
            movie.release_date = release_date || movie.release_date
            movie.length = length || movie.length
            movie.genre_id = genre_id || movie.genre_id

            await movie.save()


            return res.status(200).json({
                ok: true,
                meta: {
                    status: 200,
                    total: movie.length,
                    url: 'api/movies/update/:id'
                },
                msg: "Pelicula actualizada con exito",
                data: {
                    movie
                }
            })
        } catch (error) {
            return res.status(error.status || 500).json({
                ok: false,
                status: error.status || 500,
                message: error.message || "upss, error!!!",
            })
        }
    },
    destroy: (req, res) => {
        let movieId = req.params.id;
        Movies
            .destroy({ where: { id: movieId }, force: true }) // force: true es para asegurar que se ejecute la acción
            .then(confirm => {
                let respuesta;
                if (confirm) {
                    respuesta = {
                        meta: {
                            status: 200,
                            total: confirm.length,
                            url: 'api/movies/destroy/:id'
                        },
                        data: confirm
                    }
                } else {
                    respuesta = {
                        meta: {
                            status: 204,
                            total: confirm.length,
                            url: 'api/movies/destroy/:id'
                        },
                        data: confirm
                    }
                }
                res.json(respuesta);
            })
            .catch(error => res.send(error))
    }

}

module.exports = moviesAPIController;