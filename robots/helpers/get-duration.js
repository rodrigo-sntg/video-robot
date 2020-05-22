const ffprobe = require('ffprobe-static')
const execa = require('execa')
const isStream = require('./is-stream')
const stream = require('stream')


async function getFFprobeWrappedExecution (input) {
  const params = ['-v', 'error', '-select_streams', 'a:0', '-show_format', '-show_streams']

  if (typeof input === 'string') {
    return await execa(ffprobe.path, [...params, input])
  }

  if (isStream(input)) {
    return await execa(ffprobe.path, [...params, '-i', 'pipe:0'], {
      reject: false,
      input
    })
  }

  throw new Error('Given input was neither a string nor a Stream')
}

/**
 * Returns a promise that will be resolved with the duration of given audio in
 * seconds.
 *
 * @param  {Stream|String} input Stream or path to file to be used as input for
 * `ffprobe`.
 *
 * @return {Promise} Promise that will be resolved with given audio duration in
 * seconds.
 */
async function getAudioDurationInSeconds (input) {
  const { stdout } = await getFFprobeWrappedExecution(input)
  const matched = stdout.match(/duration="?(\d*\.\d*)"?/)
  if (matched && matched[1]) return parseFloat(matched[1])
  throw new Error('No duration found!')
}

// export default getAudioDurationInSeconds
module.exports = getAudioDurationInSeconds