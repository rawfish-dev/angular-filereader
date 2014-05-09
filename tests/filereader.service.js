'use strict';

describe('Service: FileReader', function () {

  // load the service's module
  beforeEach(module('filereader'));

  // instantiate service
  var FileReader, MockFileReader, $window, $scope;

  beforeEach(function () {

    // Mock FileReader
    MockFileReader = {
      readAsDataURL: function (file) {
        if (file === 'file') {
          this.result = 'readedFile';
          this.onload();
        } else if (file === 'progress') {
          this.onprogress({total: 70, loaded: 30});
        } else {
          this.result = 'fileError';
          this.onerror();
        }
      }
    };

    spyOn(MockFileReader, 'readAsDataURL').and.callThrough();
    // Mock window
    $window = {
      FileReader: jasmine.createSpy('FileReader').and.returnValue(MockFileReader)
    };


    module(function ($provide){
      $provide.value('$window', $window);
    });
  });

  beforeEach(inject(function (_FileReader_, $rootScope) {
    FileReader = _FileReader_;
    $scope = $rootScope.$new();
  }));

  describe('Method: readAsDataUrl', function () {

    it('should return a promise', function () {
      var promise = FileReader.readAsDataUrl('file', $scope);
      expect(promise.then).toBeDefined();
    });

    it('should instantiate a FileReader instance', function () {
      FileReader.readAsDataUrl('file', $scope);
      expect($window.FileReader).toHaveBeenCalled();
    });

    it('should call readAsDataURL', function () {
      FileReader.readAsDataUrl('file', $scope);
      expect(MockFileReader.readAsDataURL).toHaveBeenCalledWith('file');
    });

    it('should resolve promise when onload is called', function () {
      var promise = FileReader.readAsDataUrl('file', $scope);
      var success, error;

      promise.then(function (resp) {
        success = resp;
      }, function () {
        error = 'this should never happen';
      });

      $scope.$apply();

      expect(error).not.toBeDefined();
      expect(success).toEqual('readedFile');
    });

    it('should reject promise when onerror is called', function () {
      var promise = FileReader.readAsDataUrl('error', $scope);
      var success, error;

      promise.then(function () {
        success = 'this should never happen';
      }, function (err) {
        error = err;
      });

      $scope.$apply();

      expect(success).not.toBeDefined();
      expect(error).toEqual('fileError');
    });

    it('should broadcast an event when onprogress is called', function () {
      var total, loaded;

      $scope.$on('fileProgress', function (event, data) {
        total = data.total;
        loaded = data.loaded;
      });

      FileReader.readAsDataUrl('progress', $scope);

      $scope.$apply();

      expect(total).toEqual(70);
      expect(loaded).toEqual(30);
    });

  });

});
