const { body } = require('express-validator');

const SearchValidator = [
    body(['checkin', 'checkout'])
        .notEmpty().withMessage("The value is required")
        .isDate().withMessage("The value must be date")
        .isISO8601().withMessage("The format is invalid. The format must be YYYY-MM-DD."),
    body('checkin')
        .not().isBefore(new Date().toISOString().split('T')[0]).withMessage('Date must be today or later'),
    body('checkout')
        .custom((value, { req }) => {
            const checkin = req.body.checkin
            if(new Date(value).toISOString() < checkin) throw new Error('Date must be on or after check-in date');
            return true
        })
]

module.exports = SearchValidator;