var app = angular.module('myapp', [])

app.controller('key', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
    this.$onInit = function() {
        $scope.numberCaptcha = 0;
        $scope.description = "";
        $scope.keys = []
        $http({
            method: 'POST',
            url: '/user/key',
        })
        .then(res => {
            $scope.captcha = res.data.captcha
            // console.log(res)
        })

        $http({
            method: 'POST',
            url: '/get/key'
        })
        .then(res => {
            // console.log(res)
            $scope.keys = res.data.keys
        })
        .catch(err => {

        })
    }
    $scope.clickGetCaptcha = function() {
        $http({
            method: 'POST',
            url: '/user/key',
        })
        .then(res => {
            $scope.captcha = res.data.captcha
            // console.log(res)
        })
        .catch(() => {

        })
    }
    $scope.clickCreateKey = function() {
        $http({
            method: 'POST',
            url: '/create/key',
            data: {
                captcha: $scope.numberCaptcha,
                description: $scope.description
            }
        })
        .then(res => {
            let key = res.data.key
            $scope.captcha = key.userCaptcha
            $scope.keys.push(key)
            
            $scope.numberCaptcha = 0
            $scope.description = ""
        })
        .catch(() => {
            
        })
    }
    $scope.clickEditOrSave = function(key) {
        // console.log(key)
        key.showEdit = !key.showEdit;
        if(key.showEdit == true) {
            return
        }
        $http({
            method: "POST",
            url: "/edit/key",
            data: {
                key: key
            }
        })
        .then(res => {
            // console.log(res)
            $scope.captcha = res.data.key.userCaptcha
        })
        .catch(() => {

        })
    }
    $scope.clickDelete = function(key) {
        // console.log(key)
        let confirm = window.confirm("Bạn muốn xóa key này?");
        if(confirm) {
            $http({
                method: "POST",
                url: "/delete/key",
                data: {
                    key: key
                }
            })
            .then((res) => {
                $scope.keys.indexOf(key) != -1 ? $scope.keys.splice($scope.keys.indexOf(key), 1) : null
                $scope.captcha = res.data.userCaptcha
            })
            .catch(() => {
                
            })
        }
    }   
    $scope.clickReload = function(key) {
        console.log(key)
        let confirm = window.confirm("Bạn muốn thay đổi key này?");
        if(confirm) {
            $http({
                method: "POST",
                url: "/reload/key",
                data: {
                    key: key
                }
            })
            .then((res) => {
                key.key = res.data.key.key
            })
            .catch(() => {
                
            })
        }
    }
}])

app.controller('setting', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
    $scope.clickChangePassword = function() {
        if(!$scope.password || !$scope.renewpassword || !$scope.newpassword) {
            return;
        }
        $http({
            method: "POST",
            url: "/user/password",
            data: {
                password: $scope.password,
                newPassword: $scope.newpassword,
                reNewPassword: $scope.renewpassword
            }
        })
        .then(() => {
            $scope.password = ""
            $scope.newpassword = ""
            $scope.renewpassword = ""
        })
        .catch(() => {

        })
    }
}])

app.controller('checkKey', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
    $scope.clickCheck = function() {
        if(!$scope.key) {
            return;
        }
        $http({
            method: "POST",
            url: "/api/check",
            data: {
                key: $scope.key,
            }
        })
        .then(res => {
            $scope.captcha = res.data.captcha
        })
        .catch(() => {

        })
    }
}])
