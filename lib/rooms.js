"use strict";

/**
 * Manages a user in a chat session
 */
class Client {
  /**
   * @constructor
   * @param isInitiator
   *  determines if the user is the initiator/host of
   *  the chat
   */
  constructor(isInitiator) {
    this.isInitiator = isInitiator;
    this.messages = [];
  }

  addMessage(message) {
    this.messages.push(message);
  }

  clearMessages() {
    this.messages = [];
  }

  toString() {
    return '{ '+ this.isInitiator +', '+ this.messages.length +' }';
  }
}

/**
 * Manges a video chat session containing information about
 * the 2 users in a chat.
 */
class Room {
  /**
   * @constructor
   */
  constructor() {
    this.clientMap = new Map(); //map of key/value pair for client objects
  }

  getOccupancy() {
    return this.clientMap.size;
  }

  hasClient(clientId) {
    return this.clientMap.has(clientId);
  }

  join(clientId, callback) {
    var otherClient = this.clientMap.values().next().value;
    var isInitiator = !otherClient;
    var client = new Client(isInitiator);
    this.clientMap.set(clientId, client);
    if (callback) callback(null, client, otherClient);
  }

  removeClient(clientId, callback) {
    this.clientMap.delete(clientId);
    var otherClient = this.clientMap.values().next().value || null;
    callback(null, true, otherClient);
  }

  getClient(clientId) {
    return this.clientMap.get(clientId);
  }

  toString() {
    var a = [];
    for (var i of this.clientMap.keys()) a.push(i);
    return JSON.stringify(a);
  }
}

/**
 * Manages a collection of rooms to maintain video chat sessions.
 * The purpose of this class is to allow overloading this class
 * to implement memcache or redis cluser for handling large scale
 * concurrent video chat sessions.
 */
class Rooms {
  /**
   * @constructor
   */
  constructor() {
    this.roomMap = new Map(); //map of key/value pair for room objects
  }

  get(roomCacheKey, callback) {
    var room = this.roomMap.get(roomCacheKey);
    callback(null, room);
  }

  create(roomCacheKey, callback) {
    var room = new Room();
    this.roomMap.set(roomCacheKey, room);
    callback(null, room);
  }

  createIfNotExist(roomCacheKey, callback) {
    var room = this.roomMap.get(roomCacheKey);
    if (room) {
      callback(null, room);
    } else {
      this.create(roomCacheKey, callback);
    }
  }
}

module.exports = Rooms;
