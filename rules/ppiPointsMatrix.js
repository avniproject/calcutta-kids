const ppiPointsMatrix = {
    'Number of people 0-17 in the household': {
        'Five or more': 0,
        'Four': 4,
        'Three': 8,
        'Two': 13,
        'One': 20,
        'None': 27
    },
    'Principal occupation of the household': {
        'Labourers': 0,
        'Other': 8,
        'Professionals': 14
    },
    'Does the household own a television?': {
        'No': 0,
        'Yes': 6
    },
    'Does the household own a bicycle, scooter, or motor cycle?': {
        'No': 0,
        'Yes': 5
    },
    'Does the household own an almirah/dressing table?': {
        'No': 0,
        'Yes': 3
    },
    'Does the household own a sewing machine?': {
        'No': 0,
        'Yes': 6
    },
    'Pressure cookers or pressure pans owned by household': {
        'None': 0,
        'One': 6,
        'Two or more': 9
    },
    'Electric fans owned by household': {
        'None': 0,
        'One': 5,
        'Two or more': 9
    },
    'Primary source of energy for cooking in the household': {
        'Firewood and chips, charcoal': 0,
        'Other': 5,
        'Electric': 5, // Keeping it same as Other since not mentioned in doc
        'LPG': 17
    }
};

export default ppiPointsMatrix;