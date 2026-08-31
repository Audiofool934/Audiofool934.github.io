// Reproduce the geometry and illustrative probability model used in
// "A Side Note on a Lunar Transit"
//
// Ephemeris source and query reference:
// https://ssd.jpl.nasa.gov/horizons/manual.html
// Moon physical parameters:
// https://ssd.jpl.nasa.gov/sats/phys_par/sep.html
// Representative aircraft dimensions:
// https://www.aircraft.airbus.com/en/aircraft/a320-family/a320ceo
// https://www.boeing.com/commercial/737ng

const inputs = Object.freeze({
    moonDiameterPixels: 930,
    aircraftLengthPixels: 280,
    aircraftCenterOffsetPixels: 231.5,
    moonAngularDiameterArcseconds: 1876.915,
    moonElevationDegrees: 3.336635,
    representativeAircraftLengthMeters: 39.5,
    representativeAircraftHeightMeters: 12.5,
    exposureSeconds: 1 / 80,
    representativeAircraftSpeedMetersPerSecond: 80,
    firstEphemeris: {
        timestamp: '2026-08-30T11:51:30.911Z',
        azimuthDegrees: 85.951272,
        elevationDegrees: 1.738262,
    },
    secondEphemeris: {
        timestamp: '2026-08-30T11:59:58.364Z',
        azimuthDegrees: 87.2319,
        elevationDegrees: 3.336635,
    },
});

const scenarios = [
    {
        name: 'Conservative',
        headwayMinutes: 6,
        routeOffsetMeters: 150,
        routeSigmaMeters: 300,
        captureEfficiency: 0.6,
    },
    {
        name: 'Central',
        headwayMinutes: 4,
        routeOffsetMeters: 100,
        routeSigmaMeters: 200,
        captureEfficiency: 0.75,
    },
    {
        name: 'Well-aligned busy',
        headwayMinutes: 2,
        routeOffsetMeters: 0,
        routeSigmaMeters: 100,
        captureEfficiency: 0.9,
    },
];

function degreesToRadians(degrees) {
    return degrees * Math.PI / 180;
}

function arcsecondsToRadians(arcseconds) {
    return degreesToRadians(arcseconds / 3600);
}

function greatCircleSeparation(first, second) {
    const azimuthDelta = degreesToRadians(
        second.azimuthDegrees - first.azimuthDegrees,
    );
    const elevationOne = degreesToRadians(first.elevationDegrees);
    const elevationTwo = degreesToRadians(second.elevationDegrees);
    const cosine =
        Math.sin(elevationOne) * Math.sin(elevationTwo) +
        Math.cos(elevationOne) * Math.cos(elevationTwo) *
            Math.cos(azimuthDelta);

    return Math.acos(Math.min(1, Math.max(-1, cosine)));
}

// Abramowitz and Stegun 7.1.26 approximation.
function erf(value) {
    const sign = value < 0 ? -1 : 1;
    const x = Math.abs(value);
    const p = 0.3275911;
    const coefficients = [
        0.254829592,
        -0.284496736,
        1.421413741,
        -1.453152027,
        1.061405429,
    ];
    const t = 1 / (1 + p * x);
    const polynomial =
        ((((coefficients[4] * t + coefficients[3]) * t + coefficients[2]) *
            t +
            coefficients[1]) *
            t +
            coefficients[0]) *
        t;

    return sign * (1 - polynomial * Math.exp(-x * x));
}

function normalCdf(value) {
    return 0.5 * (1 + erf(value / Math.sqrt(2)));
}

function round(value, digits = 2) {
    return Number(value.toFixed(digits));
}

const moonAngularDiameter = arcsecondsToRadians(
    inputs.moonAngularDiameterArcseconds,
);
const aircraftAngularLength =
    moonAngularDiameter *
    (inputs.aircraftLengthPixels / inputs.moonDiameterPixels);
const slantRangeMeters =
    inputs.representativeAircraftLengthMeters /
    (2 * Math.tan(aircraftAngularLength / 2));
const lunarDiskDiameterMeters =
    2 * slantRangeMeters * Math.tan(moonAngularDiameter / 2);
const relativeHeightMeters =
    slantRangeMeters * Math.sin(degreesToRadians(inputs.moonElevationDegrees));
const normalizedImpactParameter =
    inputs.aircraftCenterOffsetPixels /
    (inputs.moonDiameterPixels / 2);
const lunarChordMeters =
    lunarDiskDiameterMeters *
    Math.sqrt(1 - normalizedImpactParameter ** 2);
const fullContainmentPathMeters =
    lunarChordMeters - inputs.representativeAircraftLengthMeters;
const anyOverlapPathMeters =
    lunarChordMeters + inputs.representativeAircraftLengthMeters;
const metersPerPixel =
    lunarDiskDiameterMeters / inputs.moonDiameterPixels;
const exposureTravelPixels =
    inputs.representativeAircraftSpeedMetersPerSecond *
    inputs.exposureSeconds /
    metersPerPixel;

const ephemerisElapsedMinutes =
    (Date.parse(inputs.secondEphemeris.timestamp) -
        Date.parse(inputs.firstEphemeris.timestamp)) /
    60000;
const moonSkyRateRadiansPerMinute =
    greatCircleSeparation(inputs.firstEphemeris, inputs.secondEphemeris) /
    ephemerisElapsedMinutes;
const projectedMoonSweepMetersPerMinute =
    2 * slantRangeMeters * Math.tan(moonSkyRateRadiansPerMinute / 2);
const fullContainmentHalfToleranceMeters =
    (lunarDiskDiameterMeters - inputs.representativeAircraftHeightMeters) / 2;
const alignmentWindowMinutes =
    (2 * fullContainmentHalfToleranceMeters) /
    projectedMoonSweepMetersPerMinute;

const results = scenarios.map((scenario) => {
    const upperZ =
        (fullContainmentHalfToleranceMeters - scenario.routeOffsetMeters) /
        scenario.routeSigmaMeters;
    const lowerZ =
        (-fullContainmentHalfToleranceMeters - scenario.routeOffsetMeters) /
        scenario.routeSigmaMeters;
    const routeAlignmentProbability = normalCdf(upperZ) - normalCdf(lowerZ);
    const expectedSuccesses =
        (alignmentWindowMinutes / scenario.headwayMinutes) *
        routeAlignmentProbability *
        scenario.captureEfficiency;
    const atLeastOneProbability = 1 - Math.exp(-expectedSuccesses);

    return {
        scenario: scenario.name,
        routeAlignmentProbabilityPercent: round(
            routeAlignmentProbability * 100,
            1,
        ),
        atLeastOneProbabilityPercent: round(atLeastOneProbability * 100, 1),
    };
});

const output = {
    measurements: inputs,
    geometry: {
        moonAngularDiameterDegrees: round(
            inputs.moonAngularDiameterArcseconds / 3600,
            4,
        ),
        aircraftAngularLengthDegrees: round(
            aircraftAngularLength * 180 / Math.PI,
            4,
        ),
        representativeSlantRangeKilometers: round(slantRangeMeters / 1000),
        lunarDiskAtAircraftMeters: round(lunarDiskDiameterMeters, 1),
        relativeHeightAboveCameraHorizontalMeters: round(relativeHeightMeters),
        normalizedImpactParameter: round(normalizedImpactParameter, 3),
        lunarChordAtTransitMeters: round(lunarChordMeters, 1),
        fullContainmentSecondsAt65To90MetersPerSecond: [
            round(fullContainmentPathMeters / 90, 2),
            round(fullContainmentPathMeters / 65, 2),
        ],
        anyOverlapSecondsAt65To90MetersPerSecond: [
            round(anyOverlapPathMeters / 90, 2),
            round(anyOverlapPathMeters / 65, 2),
        ],
        exposureTravelPixelsAt80MetersPerSecond: round(exposureTravelPixels, 1),
        moonSkyRateRadiansPerMinute: round(moonSkyRateRadiansPerMinute, 6),
        projectedMoonSweepMetersPerMinute: round(
            projectedMoonSweepMetersPerMinute,
            1,
        ),
        fullContainmentHalfToleranceMeters: round(
            fullContainmentHalfToleranceMeters,
            1,
        ),
        effectiveAlignmentWindowMinutes: round(alignmentWindowMinutes, 2),
    },
    illustrativeScenarios: results,
};

console.log(JSON.stringify(output, null, 2));
