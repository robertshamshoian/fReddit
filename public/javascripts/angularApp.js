
angular.module('fReddit', ['ui.router'])
.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
      templateUrl: '/home.html',
      controller: 'MainCtrl',
      resolve: {
        postPromise: ['posts', function(posts){
          return posts.getAll();
        }]
      }
    })
    .state('posts', {
      url: '/posts/{id}',
      templateUrl: '/posts.html',
      controller: 'PostsCtrl',
      resolve: {
        post: ['$stateParams', 'posts', function($stateParams, posts) {
          return posts.get($stateParams.id);
        }]
      }
    });

  $urlRouterProvider.otherwise('home');
}])
.factory('posts', ['$http', function($http){
  var x = {
    posts: []
  };

  x.get = function(id) {
    return $http.get('/posts/' + id).then(function(res){
      return res.data;
    });
  };

  x.getAll = function() {
    return $http.get('/posts').success(function(data){
      angular.copy(data, x.posts);
    });
  };

  x.create = function(post) {
    return $http.post('/posts', post).success(function(data){
      x.posts.push(data);
    });
  };

  x.upvote = function(post) {
    return $http.put('/posts/' + post._id + '/upvote')
      .success(function(data){
        post.upvotes += 1;
      });
  };

  x.downvote = function(post) {
    return $http.put('/posts/' + post._id + '/downvote')
      .success(function(data){
        post.upvotes -= 1;
      });
  };

  x.addComment = function(id, comment) {
    return $http.post('/posts/' + id + '/comments', comment);
  };

  x.upvoteComment = function(post, comment) {
    return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/upvote')
      .success(function(data){
        comment.upvotes += 1;
      });
  };
    x.downvoteComment = function(post, comment) {
    return $http.put('/posts/' + post._id + '/comments/'+ comment._id + '/downvote')
      .success(function(data){
        comment.upvotes -= 1;
      });
  };

  return x;
}])
.controller('MainCtrl', [
'$scope',
'posts',
function($scope, posts){
  $scope.test = 'Hello world!';

  $scope.posts = posts.posts;

  $scope.addPost = function(){
    if($scope.title === '') { return; }
    posts.create({
      title: $scope.title,
      link: $scope.link,
    });
    $scope.title = '';
    $scope.link = '';
  };

  $scope.incrementUpvotes = function(post) {
    posts.upvote(post);
  };
  $scope.decreaseUpvotes = function(post) {
    posts.downvote(post);
  };

}])
.controller('PostsCtrl', [
'$scope',
'posts',
'post',
function($scope, posts, post){
  $scope.post = post;

  $scope.addComment = function(){
    if($scope.body === '') { return; }
    posts.addComment(post._id, {
      body: $scope.body,
      author: 'user',
    }).success(function(comment) {
      $scope.post.comments.push(comment);
    });
    $scope.body = '';
  };

  $scope.incrementUpvotes = function(comment){
    posts.upvoteComment(post, comment);
  };
  $scope.decreaseUpvotes = function(comment){
    posts.downvoteComment(post, comment);
  };
}]);
