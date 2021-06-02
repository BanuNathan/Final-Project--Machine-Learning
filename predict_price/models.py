def create_classes(db):
    class Home(db.Model):
        __tablename__ = 'homeRecords'

        id = db.Column(db.Integer, primary_key=True)
        date = db.Column(db.String)
        price = db.Column(db.Float)
        bedrooms = db.Column(db.Integer)	
        bathrooms= db.Column(db.Float)
        sqft_living	= db.Column(db.Integer)
        sqft_lot = db.Column(db.Integer)
        floors	= db.Column(db.Float)
        condition	= db.Column(db.Integer)
        sqft_above	= db.Column(db.Integer)
        sqft_basement	= db.Column(db.Integer)
        yr_built	= db.Column(db.Integer)
        yr_renovated	= db.Column(db.Integer)
        street = db.Column(db.String)
        city	= db.Column(db.String)
        state	= db.Column(db.String)
        zip	= db.Column(db.Integer)
        year_sold	= db.Column(db.String)
        age_of_house	= db.Column(db.Integer)
        Latitude = db.Column(db.Float)
        Longitude = db.Column(db.Float)

        def __repr__(self):
            return '<Home %r>' % (self.street)
    return Home