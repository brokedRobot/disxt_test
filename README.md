# disxt_test

to start, in directory execute 'docker-compose build; docker-compose up;'

to operate on http://127.0.0.1:8000/, use sign-in form, then open development tools, and enter into console for example:

	dt.product.create({name: 'test', price: '$1.99', description: 'test1'});

	dt.product.edit({_id: '5ef7c1777580be0019fd9182', price: '$2.50', description: 'test2'});

	dt.product.remove({_id: '5ef7c1777580be0019fd9182'});
