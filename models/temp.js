const agg = [
    {
      '$match': {
        'product': new ObjectId('6312fdf21fd0d62272b11651')
      }
    }, {
      '$group': {
        '_id': null, 
        'averageRating': {
          '$avg': '$rating'
        }, 
        'numberOfReviews': {
          '$sum': 1
        }
      }
    }
  ]