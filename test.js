
var test = require('tape')
  , mqtt = require('./')

function testParse(name, expected, fixture, rest, opts) {
  test(name, function(t) {
    t.plan(2)

    var parser = mqtt.parser(opts)
      , rest

    parser.on('packet', function(packet) {
      t.deepEqual(packet, expected, 'expected packet')
    })

    t.equal(parser.parse(fixture), rest || 0, 'remaining bytes')
  })
}

function testError(expected, fixture) {
  test(expected, function(t) {
    t.plan(1)

    var parser = mqtt.parser()
      , rest

    parser.on('error', function(err) {
      t.equal(err.message, expected, 'expected error message')
    })

    parser.parse(fixture)
  })
}

testParse('minimal connect', {
    cmd: "connect"
  , retain: false
  , qos: 0
  , dup: false
  , length: 18
  , protocolId: "MQIsdp"
  , protocolVersion: 3
  , clean: false
  , keepalive: 30
  , clientId: "test"
}, new Buffer([
  16, 18, // Header
  0, 6, // Protocol id length
  77, 81, 73, 115, 100, 112, // Protocol id
  3, // Protocol version
  0, // Connect flags
  0, 30, // Keepalive
  0, 4, //Client id length
  116, 101, 115, 116 // Client id
]))


testParse('maximal connect', {
    cmd: "connect"
  , retain: false
  , qos: 0
  , dup: false
  , length: 54
  , protocolId: "MQIsdp"
  , protocolVersion: 3
  , will: {
      retain: true
    , qos: 2
    , topic: "topic"
    , payload: "payload"
    }
  , clean: true
  , keepalive: 30
  , clientId: "test"
  , username: "username"
  , password: "password"
}, new Buffer([
  16, 54, // Header
  0, 6, // Protocol id length
  77, 81, 73, 115, 100, 112, // Protocol id
  3, // Protocol version
  246, // Connect flags
  0, 30, // Keepalive
  0, 4, // Client id length
  116, 101, 115, 116, // Client id
  0, 5, // will topic length
  116, 111, 112, 105, 99, // will topic
  0, 7, // will payload length
  112, 97, 121, 108, 111, 97, 100, // will payload
  0, 8, // username length
  117, 115, 101, 114, 110, 97, 109, 101, // username
  0, 8, // password length
  112, 97, 115, 115, 119, 111, 114, 100 //password
]))

testParse('binary username/password', {
    cmd: "connect"
  , retain: false
  , qos: 0
  , dup: false
  , length: 28
  , protocolId: new Buffer([77, 81, 73, 115, 100, 112])
  , protocolVersion: 3
  , clean: false
  , keepalive: 30
  , clientId: new Buffer([116, 101, 115, 116])
  , username: new Buffer([12, 13, 14])
  , password: new Buffer([15, 16, 17])
}, new Buffer([
    16, 28, // Header
    0, 6, // Protocol id length
    77, 81, 73, 115, 100, 112, // Protocol id
    3, // Protocol version
    0x80 | 0x40, // Connect flags
    0, 30, // Keepalive
    0, 4, //Client id length
    116, 101, 115, 116, // Client id
    0, 3, // username length
    12, 13, 14, // username
    0, 3, // password length
    15, 16, 17 //password
]), 0, {
  encoding: 'binary'
})

testError('cannot parse protocol id', new Buffer([
  16, 4,
  0, 6,
  77, 81
]))

testParse('connack with return code 0', {
    cmd: 'connack'
  , retain: false
  , qos: 0
  , dup: false
  , length: 2
  , returnCode: 0
}, new Buffer([
  32, 2, 0, 0
]))

testParse('connack with return code 5', {
    cmd: 'connack'
  , retain: false
  , qos: 0
  , dup: false
  , length: 2
  , returnCode: 5
}, new Buffer([
  32, 2, 0, 5
]))
