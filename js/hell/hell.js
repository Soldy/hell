const Hell = function(config_){
    this.formAdd = function(db, store){
        return _layer[db][store].forms.add;
    };
    this.table = function(db, store){
        return _layer[db][store].table;
    };
    const _config = config_;
    const _dbs = {};
    const _layer = {};
    const _update = function(){
        for (let db of _config.databases){
            for (let store of db.stores){
                _layer[db.name][store.name]
                  .table.update();
            };
        };
    };
    const HellTableLayer = function(store_, db_){
        this.render = function(){
            return _hellTable.render();
        };
        this.update = async function(){
            console.log(_db);
            console.log(_layer);
            console.log(_store);
            console.log(_layer[_db]);
            console.log(_store.name);
            console.log(_layer[_db][_store.name]);
            for (let i in _layer[_db]){
                console.log("."+i+".");
                console.log(_layer[_db][i]);

            }
            console.log(_layer[_db][_store.name]);
            console.log(await _layer[
                   _db
                ][
                   _store.name
                ].db.getAll());
            _hellTable.data(
              await _layer[
                   _db
                ][
                   _store.name
                ].db.getAll()
            );
        };
        const _db = db_.toString();
        const _store = store_;
        console.log(store_);
        const _fields = store_.fields;
        const _hellTable = new hellTableClass();
        const _fieldBuilder = function(fields){
            const out = {
              'id':'ID'
            };
            for (let i of fields){
                out[i.name] = i.title;
            };
            return out;
        };
        _hellTable.header(
            _fieldBuilder(_fields)
        );
        this.update();
    };

    const HellFormAdd = function(store_, db_){
        this.render = function(){
            return  _hellForm.render();
        };
        const _db = db_.toString();
        const _store = store_;
        const _hellForm = new HellForm();
        const _hellBuild = function(){
            _hellForm.addTitle(
              _store.title+' Add'
            );
            for (let f of _store.fields){
                _hellForm.addText(
                  f.title,
                  f.name
                );
            }
            _hellForm.addSubmit(
              'Add',
              'add',
              async function(){
                 _layer[
                   _db
                ][
                   _store.name
                ].db.add(
                   _hellForm.json()
                 );
                 _update();
              }
           );
        };
        _hellBuild();
    };

    const HellIndexedDbLayer = function(store_, db_){
        this.add = function(data){
            _db.add(
              _name,
              data
            );
        };
        this.getAll = async function(){
            return new Promise((resolve) => {
              return _db.getAll(
                _name,
                resolve
              )
            });
        };
        const _name = store_.name.toString();
        const _db = db_;
    };

    const Manager = function(){
        const _build = function(){
            for (let db of _config.databases){
                _buildDatabase(db);
            }
        };
        const _buildDatabase = function(db){
            const dbName = db.name;
            _dbs[dbName] = new HellIndexedDb(db);
            _layer[dbName] = {};
            for (let store of db.stores){
                 let col = {}
                 _layer[dbName][store.name] = col;
                 col.db = new HellIndexedDbLayer(
                   store,
                   _dbs[dbName]
                 );
                 col.table = new HellTableLayer(
                   store,
                   dbName
                   
                 );
                 col.forms = {};
                 col.forms.add = new HellFormAdd(
                   store,
                   dbName
                 );
            };
        };
        _build();
    };
    const _manager = new Manager();
}
