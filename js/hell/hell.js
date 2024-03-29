const funcString = function(in_){
    const out = {func:"",size:0};
    const peace = in_.replace(')','').split('(');
    out.func = peace[0];
    if(in_.length == 2)
        out.size = peace[1];
    return out;
}

const Hell = function(config_, target_){
    this.formAdd = function(db, store){
        return _layer[db][store].forms.add;
    };
    this.table = function(db, store){
        return _layer[db][store].table;
    };
    const _config = config_;
    const _dbs = {};
    const _layer = {};
    const _frames = new HellFrames();
    const _menu = new HellMenu();
    const _target = target_;
    
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
    const HellPageLayer = function(store_, db_){
        const _store = store_.name;
        const _db = db_;
        _frames
        .add(
          _store,
          new HellFramePage(
            (
              _layer[_db][_store]
              .forms.add.render()
            ),
            (
              _layer[_db][_store]
              .table.render()
            )
          )
        );

    };

    const HellMenuLayer = function(store_, db_){
        const _name = store_.name;
        const _title = store_.title;
        const _icon = store_.icon;
        _menu.add(
           _name,
           _title,
            function(){_frames.set(_name)},
            _icon,
            'main'
        );
    };

    const HellTableLayer = function(store_, db_){
        this.render = function(){
            return _hellTable.render();
        };
        this.update = async function(){
            const full_data =  await _layer[
                _db
              ][
                _store.name
              ].db.getAll();
            for (let i of _store.fields){
                if(
                  (typeof i.table !== 'boolean')||
                  (i.table === false)
                )
                    continue;
                if (i.type === 'foreign'){
                    let trans = await _layer[
                      i.database
                    ][
                      i.store
                    ].db.getAll();
                    let dict = {};
                    for (let t of trans){
                        dict[t.id] = t[i.field];
                    }
                    for (let d of full_data){
                        d[i.name] = dict[d[i.name]];
                    }
                }
            }
            _hellTable.data(
              full_data
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
                if(
                  (typeof i.table !== 'boolean')||
                  (i.table === false)
                )
                    continue;
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
        this.build = async function(){
            await _build();
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
            _frames.menu(
              _menu.render()
            );
            console.log(_menu.render());
            _target.appendChild(
              _frames.render()
            );
        };
        const _buildDatabase = async function(db){
            const db_name = db.name;
            if(
              (typeof db.backup === 'boolean' ) &&
              (db.backup === true )
            ){
                _dbs[db_name] = HellIndexedDbBackup(db);
            } else {
                _dbs[db_name] = new HellIndexedDb(db);
            }
            _layer[db_name] = {};
            for (let store of db.stores){
                 let col = {forms:{}};
                 _layer[db_name][store.name] = col;
                 col.db = new HellIndexedDbLayer(
                   store,
                   db_name
                 );
            }
            for (let store of db.stores){
                 _layer[db_name][store.name]
                 .table = new HellTableLayer(
                   store,
                   db_name
                 );
                 _layer[db_name][store.name]
                 .forms.add = new HellFormAdd(
                   store,
                   db_name
                 );
                 _layer[db_name][store.name]
                 .menu = new HellMenuLayer(store, db_name);
                 _layer[db_name][store.name]
                 .page = new HellPageLayer(store, db_name);
            };
        };
        _build();
    };

    const _manager = new Manager();
}
