
var mongoose = require('mongoose')
  , should = require('should')
  , request = require('supertest')
  , app = require('../server')
  , context = describe
  , User = mongoose.model('User')  

var count

describe('Users', function () {
  describe('POST /users', function () {
    describe('Invalid parameters', function () {
      before(function (done) {
        User.count(function (err, cnt) {
          count = cnt
          done()
        })
      })

      it('no email - should respond with errors', function (done) {
        request(app)
        .post('/users')
        .send({ first_name: 'Foo bar',last_name: 'foobar', email:'foob', password: '11212'})        
        .expect(200)        
        .end(done)
      })
      it('should not save the user to the database', function (done) {
        User.count(function (err, cnt) {
          count.should.equal(cnt)
          done()
        })
      })
    })

    describe('Valid parameters', function () {
      before(function (done) {
        User.count(function (err, cnt) {
          count = cnt
          done()
        })
      })
      
      it('should create user', function (done) {
        request(app)
        .post('/users')
        .send({ first_name: 'Foo bar',last_name: 'foobar', email:'foobar@example.com', password: '11212'})        
        .end(function(err, res){          
          if (err) console.log(err);
          done()
        });
      })

      it('should insert a record to the database', function (done) {
        User.count(function (err, cnt) {          
          cnt.should.equal(count + 1)
          done()
        })
      })

      it('should save the user to the database', function (done) {
        User.findOne({ last_name: 'foobar' }).exec(function (err, user) {
          should.not.exist(err)
          user.should.be.an.instanceOf(User)
          user.email.should.equal('foobar@example.com')
          done()
        })
      })
    })
  })

  after(function (done) {
    require('./helper').clearDb(done)
  })
})
