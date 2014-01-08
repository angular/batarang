
describe('objectId function', function() {
  var objectId = ngTool().objectId;

  it('should render string as string itself', function() {
    expect(objectId('test')).toEqual('"test"');
  });

  it('should render number as string', function() {
    expect(objectId(4)).toEqual('4');
  });

  it('should render empty object as {}', function() {
    expect(objectId({})).toEqual('{  }')
  });

  it('should render object with single attribute', function() {
    expect(objectId({a: 3})).toEqual('{ a: 3 }');
  });

  it('should render first attribute for object with several', function () {
    expect(objectId({a: 3, b: 4})).toEqual('{ a: 3, ... }');
  });

  it('should render id-like attribute even it is not first one', function() {
    expect(objectId({site: 'google.com', version: '0.3.2', email: 'frodo@shire.me'})).toEqual('{ email: "frodo@shire.me", ... }');
  });

  it('should render empty array as []', function() {
    expect(objectId([])).toEqual('[  ]');
  });

  it('should render array with single item', function() {
    expect(objectId([4])).toEqual('[ 4 ]');
  });

  it('should render only first item for array with several', function() {
    expect(objectId([3,4,5])).toEqual('[ 3, ... ]');
  });

  it('should render id-like attribute of first object in array', function() {
    expect(objectId([{comments: 4, subject: "Hello!"}, {comment: 4, subject: "Re: Hello!"}])).toEqual('[ { subject: "Hello!", ... }, ... ]');
  });

  it('should correctly render nested structures/arrays', function() {
    expect(objectId({
      name: [
        [
          [
            {mail: {id: [3]}, version: 2}
          ]
        ]
      ]
    })).toEqual('{ name: [ [ [ { mail: { id: [ 3 ] }, ... } ] ] ] }');
  });

  it('should ignore angular.js internal keys', function() {
    expect(objectId({item: 3, $$hashKey: 30})).toEqual("{ item: 3 }");
  });

  it('should convert HTML characters to entities', function() {
    expect(objectId({name: "<b>hello</b>"})).toEqual('{ name: "&lt;b&gt;hello&lt;/b&gt;" }')
  });

});