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

    const _formFields = function(form_, fields_){
        for (let f of fields_){
            form_.addText(
              f.title,
              f.name
            );
        }
    };

    const HellTableLayer = function(store_, db_){
        this.render = function(){
            return _hellTable.render();
        };
        this.update = async function(){
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
            return  _form.render();
        };
        const _db = db_.toString();
        const _store = store_;
        const _form = new HellForm();
        const _dbl = _layer[_db][_store.name].db;
        const _build = function(){
            _form.addTitle(
              _store.title+' Add'
            );
            _formFields(_form, _store.fields);
            _form.addSubmit(
              'Add',
              'add',
              async function(){
                 _dbl.add(
                   _form.json()
                 );
                 _update();
              }
           );
        };
        _build();
    };

    const HellIndexedDbLayer = function(store_, db_){
        this.add = function(data){
            _dbs[_db].add(
              _name,
              data
            );
        };
        this.getAll = async function(){
            return new Promise((resolve) => {
              return _dbs[_db].getAll(
                _name,
                resolve
              )
            });
        };
        const _name = store_.name.toString();
        const _db = db_.toString();
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
                 let col = {forms:{}};
                 _layer[dbName][store.name] = col;
                 col.db = new HellIndexedDbLayer(
                   store,
                   dbName
                 );
                 col.table = new HellTableLayer(
                   store,
                   dbName
                   
                 );
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
