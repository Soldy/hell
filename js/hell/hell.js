const funcString = function(in_){
    const out = {func:"",size:0};
    const peace = in_.replace(')','').split('(');
    out.func = peace[0];
    if(in_.length == 2)
        out.size = peace[1];
    return out;
}
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
    const selectMaker = function(form_, field_, db_){
        form_.addSelect(
          field_.title,
          field_.name,
          {}
        );
        (async function(){
        let data = await db_.getAll(); 
        let list = {};
        for(let i of data)
            list[i.id] = i[field_.field];
        form_.updateSelect(
          field_.name,
          list
        );
        })()
    }

    const _update = function(){
        for (let db of _config.databases){
            for (let store of db.stores){
                _layer[db.name][store.name]
                  .table.update();
            };
        };
    };

    const _formFields = async function(form_, fields_){
        for (let f of fields_){
            let func = funcString(f.type);
            if(func.func === 'varchar'){
                form_.addText(
                  f.title,
                  f.name
                );
            }else if(func.func === 'text'){
                form_.addArea(
                  f.title,
                  f.name
                );
            } else if(func.func === 'foreign'){
                selectMaker(
                  form_,
                  f,
                  _layer[f.database][f.store].db
                );
                
            }
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
        const _build = async function(){
            _form.addTitle(
              _store.title+' Add'
            );
            await _formFields(_form, _store.fields);
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
        const _buildDatabase = async function(db){
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
            }
            for (let store of db.stores){
                 _layer[dbName][store.name]
                 .table = new HellTableLayer(
                   store,
                   dbName
                 );
                 _layer[dbName][store.name]
                 .forms.add = new HellFormAdd(
                   store,
                   dbName
                 );
            };
        };
        _build();
    };

    const _manager = new Manager();
}
