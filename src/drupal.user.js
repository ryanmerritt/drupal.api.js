// The drupal namespace.
var drupal = drupal || {};

/** The current logged in user. */
drupal.current_user = null;

/**
 * @constructor
 * @extends drupal.entity
 * @class The user class
 *
 * @param {object} object The user object.
 * @param {function} callback The function to be called once the user has
 * been retrieved from the server.
 */
drupal.user = function(object, callback) {
  drupal.entity.call(this, object, callback);
};

/** Derive from drupal.entity. */
drupal.user.prototype = new drupal.entity();

/** Reset the constructor. */
drupal.user.prototype.constructor = drupal.user;

/**
 * Sets the object.
 *
 * @param {object} object The object which contains the data.
 */
drupal.user.prototype.set = function(object) {
  drupal.entity.prototype.set.call(this, object);

  /** The name of this entity. */
  this.entityName = 'user';

  /** Set the api. */
  this.api = this.api || new drupal.user.api();

  /** Set the ID based on the uid. */
  this.id = object.uid || this.id || 0;

  /** The name for this user. */
  this.name = object.name || this.name || '';

  /** The email address of our user. */
  this.mail = object.mail || this.mail || '';

  /** The password of the user. */
  this.pass = object.pass || this.pass || '';

  /** The status of the user. */
  this.status = object.status || this.status || 1;
};

/**
 * Sets a user session.
 *
 * @param {string} name The name of the session.
 * @param {string} sessid The session ID.
 */
drupal.user.prototype.setSession = function(name, sessid) {

  /** Set the session id for this user. */
  this.sessid = sessid;

  // Only set the session name if this user is valid and has a session name.
  if (this.id && name) {

    /** Set the session name for this user. */
    this.session_name = name;

    /** Now store this in a cookie for further authentication. */
    drupal.cookie(name, sessid);

    /** Now store this user as the 'current' user. */
    drupal.current_user = this;
  }
};

/**
 * Login a user.
 *
 * @param {function} callback The callback function.
 */
drupal.user.prototype.login = function(callback) {
  if (this.api) {
    this.api.execute('login', {
      username: this.name,
      password: this.pass
    }, (function(user) {
      return function(object) {

        // Set the session.
        user.setSession(object.session_name, object.sessid);

        // Update this object.
        user.update(object.user, callback);
      };
    })(this));
  }
};

/**
 * Register a user.
 *
 * @param {function} callback The callback function.
 */
drupal.user.prototype.register = function(callback) {
  if (this.api) {
    this.api.execute('register', this.getPOST(), (function(user) {
      return function(object) {
        user.update(object, callback);
      };
    })(this));
  }
};

/**
 * Logout the user.
 *
 * @param {function} callback The callback function.
 */
drupal.user.prototype.logout = function(callback) {
  if (this.api) {
    this.api.execute('logout', null, callback);
  }
};

/**
 * Gets a POST object.
 *
 * @return {object} The filtered object.
 */
drupal.user.prototype.getPOST = function() {

  // Add the password to POST's only.
  var post = drupal.entity.prototype.getPOST.call(this);
  post.pass = this.pass;
  return post;
};

/**
 * Returns the object to send to Services.
 *
 * @return {object} The object to send to the Services endpoint.
 */
drupal.user.prototype.get = function() {
  return jQuery.extend(drupal.entity.prototype.get.call(this), {
    name: this.name,
    mail: this.mail,
    status: this.status
  });
};
